from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.types import Command

from app.prompts.queue_expert.v1 import QUEUE_EXPERT_SYSTEM_PROMPT
from app.schema.queue import QueueDesign
from app.state.desgin_state import DesignState
from app.tools.calculator import calculator
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node

llm_with_tools = llm.bind_tools([calculator])
llm_structured = llm.with_structured_output(QueueDesign)

MAX_TOOL_ITERATIONS = 3


@timed_node("queue_expert_agent")
@catch_agent_errors("queue_expert_agent")
async def queue_expert_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    traffic_estimates = state.get('traffic_estimates')
    database_design = state.get('database_design')

    human_prompt = (
        f"Clarified requirements:\n{clarified_requirements}\n\n"
        f"Traffic estimates:\n{traffic_estimates or 'Not available'}\n\n"
        f"Database design:\n{
            database_design or 'Not available — reason generically about likely async needs.'}\n\n"
        "Design the queue/messaging layer, using the calculator tool to estimate throughput."
    )

    messages = [
        SystemMessage(content=QUEUE_EXPERT_SYSTEM_PROMPT),
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
        print(f"[QueueExpert] hit max tool iterations — forcing final answer")

    messages.append(HumanMessage(
        content="Produce the final queue design as structured output now, "
                "including all topics, delivery guarantees, and throughput estimates."
    ))

    result = await llm_structured.ainvoke(messages)

    return Command(
        goto="supervisor",
        update={"queue_expert": result}
    )
