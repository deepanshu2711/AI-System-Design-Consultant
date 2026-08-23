from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.types import Command

from app.prompts.database_designer.v1 import DATABASE_DESIGNER_SYSTEM_PROMPT
from app.schema.database import DatabaseDesign
from app.state.desgin_state import DesignState

from app.tools.calculator import calculator
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node

llm_with_tool = llm.bind_tools([calculator])
llm_with_structure = llm.with_structured_output(DatabaseDesign)


MAX_TOOL_ITERATIONS = 3


@timed_node("database_designer_agent")
@catch_agent_errors("database_designer_agent")
async def database_designer_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    traffic_estimates = state.get('traffic_estimates')

    human_prompt = (
        f"Clarified requirements:\n{clarified_requirements}\n\n"
        f"Traffic estimates:\n{
            traffic_estimates or 'Not available — estimate row growth conservatively from requirements alone.'}\n\n"
        "Design the database schema, using the calculator tool to estimate row "
        "counts per table where relevant."
    )

    messages = [
        SystemMessage(content=DATABASE_DESIGNER_SYSTEM_PROMPT),
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

        iterations += 1
        response = await llm_with_tool.ainvoke(messages)
        messages.append(response)

    if iterations >= MAX_TOOL_ITERATIONS and response.tool_calls:
        print(f"[DatabaseDesigner] hit max tool iterations — forcing final answer")

    messages.append(HumanMessage(
        content="Produce the final database design as structured output now, "
                "including all tables, relationships, and sample queries."
    ))

    print("🏁 Starting structured output")
    result = await llm_with_structure.ainvoke(messages)
    print("✅ Structured output completed")

    return Command(
        goto="supervisor",
        update={
            "database_design": result
        }
    )
