# agents/cdn_expert.py
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.types import Command
from app.prompts.cdn_expert.v1 import CDN_EXPERT_SYSTEM_PROMPT
from app.schema.cdn import CdnDesign
from app.state.desgin_state import DesignState
from app.utils.llm_factory import llm
from app.utils.timing import timed_node

llm_structured = llm.with_structured_output(CdnDesign)


@timed_node("cdn_expert_agent")
async def cdn_expert_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    database_design = state.get('database_design')

    messages = [
        SystemMessage(content=CDN_EXPERT_SYSTEM_PROMPT),
        HumanMessage(content=(
            f"Clarified requirements:\n{clarified_requirements}\n\n"
            f"Database design:\n{database_design}\n\n"
            "Design the CDN layer."
        )),
    ]
    result = await llm_structured.ainvoke(messages)

    return Command(goto="supervisor", update={"cdn_design": result})
