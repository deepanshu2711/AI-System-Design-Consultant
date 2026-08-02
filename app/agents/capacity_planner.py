import asyncio

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.types import Command

from app.prompts.capacity_planner.v1 import CAPACITY_PLANNER_SYSTEM_PROMPT
from app.schema.capacity import CapacityPlan
from app.state.desgin_state import DesignState
from app.tools.calculator import calculator
from app.utils.llm_factory import llm

llm_with_tools = llm.bind_tools([calculator])
llm_structured = llm.with_structured_output(CapacityPlan)


async def capacity_planner_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    traffic_estimates = state.get('traffic_estimates')

    human_prompt = (
        f"Clarified requirements:\n{clarified_requirements}\n\n"
        f"Traffic estimates (if available):\n{
            traffic_estimates or 'Not yet available — estimate conservatively from requirements alone.'}\n\n"
        "Produce the capacity plan, using the calculator tool for every unit conversion step."
    )

    messages = [
        SystemMessage(content=CAPACITY_PLANNER_SYSTEM_PROMPT),
        HumanMessage(content=human_prompt)
    ]

    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)

    while response.tool_calls:
        for tool_call in response.tool_calls:
            if tool_call['name'] == "calculator":
                result = calculator.invoke(tool_call['args'])
            else:
                result = f"Unknown tool: {tool_call['name']}"
            messages.append(ToolMessage(
                content=result, tool_call_id=tool_call['id']))

        response = await llm_with_tools.ainvoke(messages)
        messages.append(response)

    messages.append(HumanMessage(
        content="Produce the final capacity plan as structured output now. "
                "Remember: replication factor must be explicit, and storage must "
                "account for media content if relevant."
    ))

    result = await llm_structured.ainvoke(messages)

    return Command(
        goto="supervisor",
        update={"capacity_plan": result}
    )
