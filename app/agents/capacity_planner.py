
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command

from app.prompts.capacity_planner.v1 import CAPACITY_PLANNER_SYSTEM_PROMPT
from app.schema.capacity import CapacityPlan
from app.schema.error import make_agent_error
from app.state.desgin_state import DesignState
from app.tools.calculator import calculator
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node
from app.utils.constants import MAX_TOOL_ITERATIONS


format_instructions = PydanticOutputParser(
    pydantic_object=CapacityPlan).get_format_instructions()
llm_with_tools = llm.bind_tools([calculator])
llm_structured = llm.with_structured_output(CapacityPlan)


prompt = ChatPromptTemplate.from_messages([
    ("system", CAPACITY_PLANNER_SYSTEM_PROMPT),
    ("human",
     "Clarified requirements:\n{clarified_requirements}\n\n"
     "Traffic estimates (if available):\n{traffic_estimates}\n\n"
     "Produce the capacity plan, using the calculator tool for every unit "
     "conversion step. You have at most {max_tool_iterations} rounds of "
     "calculator calls — plan accordingly.\n\n"
     "Remember: replication factor must be explicit, and storage must "
     "account for media content if relevant.\n\n"
     "Your final answer will be captured as structured output matching this "
     "schema, so make sure your reasoning covers every one of these fields "
     "before you stop calling tools:\n\n{format_instructions}\n\n"
     "Do not output this JSON yourself — just state the numbers clearly in "
     "your reasoning once you're done, then stop calling tools."),
]).partial(
    format_instructions=format_instructions,
    max_tool_iterations=MAX_TOOL_ITERATIONS,
)


@timed_node("capacity_planner_agent")
@catch_agent_errors("capacity_planner_agent")
async def capacity_planner_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    traffic_estimates = state.get('traffic_estimates')

    messages = prompt.format_messages(
        clarified_requirements=clarified_requirements,
        traffic_estimates=traffic_estimates
        or 'Not yet available — estimate conservatively from requirements alone.',
    )

    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)

    iterations = 0
    while response.tool_calls and iterations < MAX_TOOL_ITERATIONS:
        for tool_call in response.tool_calls:
            if tool_call['name'] == "calculator":
                try:
                    result = calculator.invoke(tool_call['args'])
                except Exception as exc:  # let the model see and recover from bad calls
                    result = f"Calculator error: {exc}"
            else:
                result = f"Unknown tool: {tool_call['name']}"
            messages.append(ToolMessage(
                content=str(result), tool_call_id=tool_call['id']))

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
            "Produce the final capacity plan as structured output."
        ))

    result = await llm_structured.ainvoke(messages)

    if hit_iteration_cap:
        return Command(
            goto="supervisor",
            update={
                "errors": [make_agent_error(
                    node="capacity_planner_agent",
                    error_type="max_tool_iterations_exceeded",
                    message=(
                        f"Hit {MAX_TOOL_ITERATIONS} tool iterations before "
                        "the model stopped requesting tools"
                    ),
                    attempt_count=iterations,
                )],
                "capacity_plan": result,
            },
        )

    return Command(
        goto="supervisor",
        update={"capacity_plan": result}
    )
