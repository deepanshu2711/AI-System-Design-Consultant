from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command

from app.prompts.queue_expert.v1 import QUEUE_EXPERT_SYSTEM_PROMPT
from app.schema.queue import QueueDesign
from app.schema.error import make_agent_error
from app.state.desgin_state import DesignState

from app.tools.calculator import calculator
from app.utils.constants import MAX_TOOL_ITERATIONS
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm, build_llm
from app.utils.review_feedback import revision_notice
from app.utils.timing import timed_node


format_instructions = PydanticOutputParser(
    pydantic_object=QueueDesign).get_format_instructions()
llm_with_tools = llm.bind_tools([calculator])
llm_structured = build_llm(
    num_ctx=16384, num_predict=6144, timeout=360, repeat_penalty=1.4)
llm_with_structure = llm_structured.with_structured_output(QueueDesign)


prompt = ChatPromptTemplate.from_messages([
    ("system", QUEUE_EXPERT_SYSTEM_PROMPT),
    ("human",
     "Clarified requirements:\n{clarified_requirements}\n\n"
     "Traffic estimates:\n{traffic_estimates}\n\n"
     "Database design:\n{database_design}\n\n"
     "Design the queue/messaging layer, using the calculator tool to estimate "
     "throughput. You have at most {max_tool_iterations} rounds of calculator "
     "calls — plan accordingly.\n\n"
     "Your final answer will be captured as structured output matching this "
     "schema, so make sure your reasoning covers every one of these fields "
     "before you stop calling tools:\n\n{format_instructions}\n\n"
     "Do not output this JSON yourself — just state the design clearly in "
     "your reasoning once you're done, then stop calling tools."),
]).partial(
    format_instructions=format_instructions,
    max_tool_iterations=MAX_TOOL_ITERATIONS,
)


@timed_node("queue_expert_agent")
@catch_agent_errors("queue_expert_agent")
async def queue_expert_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    traffic_estimates = state.get('traffic_estimates')
    database_design = state.get('database_design')

    messages = prompt.format_messages(
        clarified_requirements=clarified_requirements,
        traffic_estimates=traffic_estimates or 'Not available',
        database_design=database_design
        or 'Not available — reason generically about likely async needs.',
    )

    if notice := revision_notice(state, "queue_expert_agent"):
        messages.append(notice)

    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)

    iterations = 0

    while response.tool_calls and iterations < MAX_TOOL_ITERATIONS:
        for tool_call in response.tool_calls:
            if tool_call['name'] == 'calculator':
                try:
                    result = calculator.invoke(tool_call['args'])
                except Exception as exc:  # let the model see and recover from bad calls
                    result = f"Calculator error: {exc}"
            else:
                result = f"Unknown tool: {tool_call['name']}"
            messages.append(ToolMessage(
                content=str(result), tool_call_id=tool_call["id"]))

        response = await llm_with_tools.ainvoke(messages)
        messages.append(response)
        iterations += 1

    hit_iteration_cap = iterations >= MAX_TOOL_ITERATIONS and bool(
        response.tool_calls)

    if hit_iteration_cap:
        # The last AIMessage still has unanswered tool_calls. Every provider
        # requires a ToolMessage for each pending tool_call_id before the
        # message list can be sent again - satisfy that contract first.
        for tool_call in response.tool_calls:
            messages.append(ToolMessage(
                content="Skipped: tool iteration limit reached.",
                tool_call_id=tool_call["id"],
            ))
        messages.append(HumanMessage(
            content="You now have all the numbers you need. "
            "Produce the final queue design as structured output."
        ))

    result = await llm_with_structure.ainvoke(messages)

    if hit_iteration_cap:
        return Command(
            goto="supervisor",
            update={
                "errors": [make_agent_error(
                    node="queue_expert_agent",
                    error_type="max_tool_iterations_exceeded",
                    message=(
                        f"Hit {MAX_TOOL_ITERATIONS} tool iterations before "
                        "the model stopped requesting tools"
                    ),
                    attempt_count=iterations,
                )],
                "queue_expert": result,
            },
        )

    return Command(
        goto="supervisor",
        update={"queue_expert": result}
    )
