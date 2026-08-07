from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.types import Command

from app.prompts.cache_expert.v1 import CACHE_EXPERT_SYSTEM_PROMPT
from app.schema.cache import CacheDesign
from app.state.desgin_state import DesignState
from app.tools.calculator import calculator
from app.utils.llm_factory import llm

llm_with_tools = llm.bind_tools([calculator])
llm_structured = llm.with_structured_output(CacheDesign)

MAX_TOOL_ITERATIONS = 6


async def cache_expert_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    traffic_estimates = state.get('traffic_estimates')
    database_design = state.get('database_design')

    human_prompt = (
        f"Clarified requirements:\n{clarified_requirements}\n\n"
        f"Traffic estimates:\n{traffic_estimates or 'Not available'}\n\n"
        f"Database design:\n{
            database_design or 'Not available — reason generically about likely entities.'}\n\n"
        "Design the caching layer, using the calculator tool to estimate memory sizing."
    )

    messages = [
        SystemMessage(content=CACHE_EXPERT_SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]

    response = await llm_with_tools.ainvoke(messages)
    messages.append(response)

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

    if iterations >= MAX_TOOL_ITERATIONS and response.tool_calls:
        print(f"[CacheExpert] hit max tool iterations — forcing final answer")

    messages.append(HumanMessage(
        content="Produce the final cache design as structured output now, "
                "including all cached items, TTLs, and memory sizing."
    ))

    result = await llm_structured.ainvoke(messages)

    print('result from cache expert', result)

    return Command(
        goto="supervisor",
        update={"cache_design": result}
    )
