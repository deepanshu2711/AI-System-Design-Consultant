from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.types import Command

from app.prompts.api_designer.v1 import API_DESIGNER_SYSTEM_PROMPT
from app.schema.api import ApiDesign
from app.state.desgin_state import DesignState
from app.tools.json_formatter import json_formatter
from app.utils.llm_factory import llm
from app.utils.timing import timed_node

llm_with_tools = llm.bind_tools([json_formatter])
llm_structured = llm.with_structured_output(ApiDesign)

MAX_TOOL_ITERATIONS = 6  # one per example payload; endpoints are capped at 6


@timed_node("api_designer_agent")
async def api_designer_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    database_design = state.get('database_design')

    human_prompt = (
        f"Clarified requirements:\n{clarified_requirements}\n\n"
        f"Database design:\n{
            database_design or 'Not available — reason generically about likely resources.'}\n\n"
        "Design the API layer. Validate every JSON example through the json_formatter tool."
    )

    messages = [
        SystemMessage(content=API_DESIGNER_SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]

    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)

    iterations = 0
    while response.tool_calls and iterations < MAX_TOOL_ITERATIONS:
        for tool_call in response.tool_calls:
            if tool_call['name'] == 'json_formatter':
                result = json_formatter.invoke(tool_call['args'])
            else:
                result = f"Unknown tool: {tool_call['name']}"
            messages.append(ToolMessage(
                content=result, tool_call_id=tool_call["id"]))

        response = await llm_with_tools.ainvoke(messages)
        messages.append(response)
        iterations += 1

    if iterations >= MAX_TOOL_ITERATIONS and response.tool_calls:
        print(f"[ApiDesigner] hit max tool iterations — forcing final answer")

    messages.append(HumanMessage(
        content="Produce the final API design as structured output now, "
                "including all endpoints with validated JSON examples."
    ))

    result = await llm_structured.ainvoke(messages)

    return Command(
        goto="supervisor",
        update={"api_design": result}
    )
