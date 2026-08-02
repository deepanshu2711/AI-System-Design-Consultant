import asyncio
from decimal import ConversionSyntax

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_core.output_parsers import PydanticOutputParser
from langgraph.types import Command

from app.prompts.traffic_estimator.v1 import TRAFFIC_ESTIMATOR_SYSTEM_PROMPT
from app.schema.traffic import TrafficEstimate
from app.state.desgin_state import DesignState
from app.tools.calculator import calculator
from app.utils.llm_factory import llm

parser = PydanticOutputParser(pydantic_object=TrafficEstimate)
llm_with_tools = llm.bind_tools([calculator])
llm_structured = llm.with_structured_output(TrafficEstimate)


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

    while response.tool_calls:
        for tool_call in response.tool_calls:
            if tool_call['name'] == 'calculator':
                result = calculator.invoke(tool_call['args'])
            else:
                result = f"Unknown tool: {tool_call['name']}"

            messages.append(ToolMessage(
                content=result, tool_call_id=tool_call["id"]))

        response = await llm_with_tools.ainvoke(messages)
        messages.append(response)

    messages.append(HumanMessage(
        content="You now have all the numbers you need. "
        "Produce the final traffic estimate as structured output."
    ))

    result = await llm_structured.ainvoke(messages)

    return Command(
        goto="supervisor",
        update={"traffic_estimates": result}
    )
