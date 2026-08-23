from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command

from app.prompts.microservice_expert.v1 import MICROSERVICE_EXPERT_SYSTEM_PROMPT
from app.schema.microservice import MicroserviceDesign
from app.state.desgin_state import DesignState
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import build_llm
from app.utils.timing import timed_node


format_instructions = PydanticOutputParser(
    pydantic_object=MicroserviceDesign).get_format_instructions()
llm_structured = build_llm(num_ctx=12288, num_predict=4608, timeout=360)
llm_with_structure = llm_structured.with_structured_output(MicroserviceDesign)

prompt = ChatPromptTemplate.from_messages([
    ("system", MICROSERVICE_EXPERT_SYSTEM_PROMPT),
    ("human",
     "Clarified requirements:\n{clarified_requirements}\n\n"
     "API design (use this as the contract between services):\n{api_design}\n\n"
     "Decompose the system into microservices.\n\n"
     "Your answer will be captured as structured output matching this schema, "
     "so make sure it covers every one of these fields:\n\n{format_instructions}"),
]).partial(format_instructions=format_instructions)


@timed_node("microservice_expert_agent")
@catch_agent_errors("microservice_expert_agent")
async def microservice_expert_agent(state: DesignState):
    messages = prompt.format_messages(
        clarified_requirements=state["clarified_requirements"],
        api_design=state["api_design"],
    )

    result = await llm_with_structure.ainvoke(messages)

    return Command(
        goto="supervisor",
        update={"microservice_design": result}
    )
