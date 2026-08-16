import asyncio

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.types import Command

from app.prompts.storage_expert.v1 import STORAGE_EXPERT_SYSTEM_PROMPT
from app.schema.storage import StorageDesign
from app.state.desgin_state import DesignState

from app.tools.calculator import calculator
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node

llm_with_tool = llm.bind_tools([calculator])
llm_with_structure = llm.with_structured_output(StorageDesign)


MAX_TOOL_ITERATIONS = 3


@timed_node("storage_expert_agent")
@catch_agent_errors("storage_expert_agent")
async def storage_expert_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    traffic_estimates = state.get('traffic_estimates')

    human_prompt = (
        f"Clarified requirements:\n{clarified_requirements}\n\n"
        f"Traffic estimates:\n{
            traffic_estimates or 'Not available — estimate row growth conservatively from requirements alone.'}"
    )

    messages = [
        SystemMessage(content=STORAGE_EXPERT_SYSTEM_PROMPT),
        HumanMessage(content=human_prompt)
    ]

    response = await llm_with_tool.ainvoke(messages)

    iterations = 0

    while response.tool_calls and iterations < MAX_TOOL_ITERATIONS:
        for tool_call in response.tool_calls:
            if tool_call['name'] == "calculator":
                result = calculator.invoke(tool_call['args'])
            else:
                result = f"Unknown tool: {tool_call['name']}"
            messages.append(ToolMessage(
                content=result, tool_call_id=tool_call['id']))

        response = await llm_with_tool.ainvoke(messages)
        messages.append(response)
        iterations += 1

    if iterations >= MAX_TOOL_ITERATIONS and response.tool_calls:
        print(f"[StorageDesigner] hit max tool iterations — forcing final answer")

    messages.append(HumanMessage(
        content="Produce the final Storage design as structured output now, "
    ))
    result = await llm_with_structure.ainvoke(messages)

    return Command(
        goto="supervisor",
        update={
            "storage_design": result
        }
    )
