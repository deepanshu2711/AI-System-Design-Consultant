import asyncio
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command
from app.prompts.traffic_estimator.v1 import TRAFFIC_ESTIMATOR_SYSTEM_PROMPT
from app.schema.error import make_agent_error
from app.schema.traffic import TrafficEstimate
from app.state.desgin_state import DesignState
from app.tools.calculator import calculator
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node
from app.utils.constants import MAX_TOOL_ITERATIONS


parser = PydanticOutputParser(pydantic_object=TrafficEstimate)
llm_with_tools = llm.bind_tools([calculator])
llm_with_structure = llm.with_structured_output(TrafficEstimate)


prompt = ChatPromptTemplate.from_messages([
    ("system", TRAFFIC_ESTIMATOR_SYSTEM_PROMPT),
    ("human",
     "Clarified requirements:\n{clarified_requirements}\n\n"
     "Produce the traffic estimate, using the calculator tool for all math. "
     "You have at most {max_tool_iterations} rounds of calculator calls — plan "
     "accordingly.\n\n"
     "Your final answer will be captured as structured output matching this "
     "schema, so make sure your reasoning covers every one of these fields "
     "before you stop calling tools:\n\n{format_instructions}\n\n"
     "Do not output this JSON yourself — just state the numbers clearly in "
     "your reasoning once you're done, then stop calling tools."),
]).partial(
    format_instructions=parser.get_format_instructions(),
    max_tool_iterations=MAX_TOOL_ITERATIONS,
)


@timed_node("traffic_estimator_agent")
@catch_agent_errors("traffic_estimator_agent")
async def traffic_estimator_agent(state: DesignState):
    clarified_requirements = state["clarified_requirements"]
    messages = prompt.format_messages(
        clarified_requirements=clarified_requirements)

    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)

    iterations = 0
    while response.tool_calls and iterations < MAX_TOOL_ITERATIONS:
        for tool_call in response.tool_calls:
            if tool_call["name"] == "calculator":
                try:
                    result = calculator.invoke(tool_call["args"])
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
            "Produce the final traffic estimate as structured output."
        ))

    result = await llm_with_structure.ainvoke(messages)

    if hit_iteration_cap:
        return Command(
            goto="supervisor",
            update={
                "errors": [make_agent_error(
                    node="traffic_estimator_agent",
                    error_type="max_tool_iterations_exceeded",
                    message=(
                        f"Hit {MAX_TOOL_ITERATIONS} tool iterations before "
                        "the model stopped requesting tools"
                    ),
                    attempt_count=iterations,
                )],
                "traffic_estimates": result,
            },
        )

    return Command(
        goto="supervisor",
        update={"traffic_estimates": result},
    )
