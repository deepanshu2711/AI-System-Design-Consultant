from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command

from app.prompts.cdn_expert.v1 import CDN_EXPERT_SYSTEM_PROMPT
from app.schema.cdn import CdnDesign
from app.state.desgin_state import DesignState
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import build_llm
from app.utils.timing import timed_node


format_instructions = PydanticOutputParser(
    pydantic_object=CdnDesign).get_format_instructions()
llm_structured = build_llm(num_ctx=12288, num_predict=4608, timeout=360)
llm_with_structure = llm_structured.with_structured_output(CdnDesign)


prompt = ChatPromptTemplate.from_messages([
    ("system", CDN_EXPERT_SYSTEM_PROMPT),
    ("human",
     "Clarified requirements:\n{clarified_requirements}\n\n"
     "Database design:\n{database_design}\n\n"
     "Design the CDN layer.\n\n"
     "Your answer will be captured as structured output matching this schema, "
     "so make sure it covers every one of these fields:\n\n{format_instructions}"),
]).partial(format_instructions=format_instructions)


@timed_node("cdn_expert_agent")
@catch_agent_errors("cdn_expert_agent")
async def cdn_expert_agent(state: DesignState):
    clarified_requirements = state.get('clarified_requirements')
    database_design = state.get('database_design')

    messages = prompt.format_messages(
        clarified_requirements=clarified_requirements,
        database_design=database_design
        or 'Not available — reason generically about likely media content.',
    )

    result = await llm_with_structure.ainvoke(messages)

    return Command(goto="supervisor", update={"cdn_design": result})
