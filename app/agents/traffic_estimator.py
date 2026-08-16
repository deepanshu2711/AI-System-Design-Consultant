import asyncio
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_core.output_parsers import PydanticOutputParser
from langgraph.types import Command

from app.prompts.traffic_estimator.v1 import TRAFFIC_ESTIMATOR_SYSTEM_PROMPT
from app.schema.error import make_agent_error
from app.schema.traffic import TrafficEstimate
from app.state.desgin_state import DesignState
from app.tools.calculator import calculator
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node

parser = PydanticOutputParser(pydantic_object=TrafficEstimate)
llm_with_tools = llm.bind_tools([calculator])
llm_structured = llm.with_structured_output(TrafficEstimate)


MAX_TOOL_ITERATIONS = 3


@timed_node("traffic_estimator_agent")
@catch_agent_errors("traffic_estimator_agent")
async def traffic_estimator_agent(state: DesignState):
    clarified_requirements = state['clarified_requirements']

    human_prompt = (
        f"Clarified requirements:\n{clarified_requirements}\n\n"
        "Produce the traffic estimate, using the calculator tool for all math."
    )

    messages = [
        SystemMessage(content=TRAFFIC_ESTIMATOR_SYSTEM_PROMPT),
        HumanMessage(content=human_prompt)
    ]

    response = await llm_with_tools.ainvoke(messages)

    iterations = 0
    while response.tool_calls and iterations < MAX_TOOL_ITERATIONS:
        for tool_call in response.tool_calls:
            if tool_call['name'] == 'calculator':
                result = calculator.invoke(tool_call['args'])
            else:
                result = f"Unknown tool: {tool_call['name']}"

            messages.append(ToolMessage(
                content=result, tool_call_id=tool_call["id"]))

        response = await llm_with_tools.ainvoke(messages)
        messages.append(response)
        iterations += 1

    hit_iteration_cap = iterations >= MAX_TOOL_ITERATIONS and response.tool_calls

    messages.append(HumanMessage(
        content="You now have all the numbers you need. "
        "Produce the final traffic estimate as structured output."
    ))

    result = await llm_structured.ainvoke(messages)

    update: dict[str, Any] = {"traffic_estimates": result}
    if hit_iteration_cap:
        update["errors"] = [make_agent_error(
            node="traffic_estimator_agent",
            error_type="max_tool_iterations_exceeded",
            message=f"Hit {
                MAX_TOOL_ITERATIONS} tool iterations before the model stopped requesting tools",
            attempt_count=iterations,
        )]

    return Command(
        goto="supervisor",
        update=update
    )
