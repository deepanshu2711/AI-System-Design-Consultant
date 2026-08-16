from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command
from app.prompts.microservice_expert.v1 import MICROSERVICE_EXPERT_SYSTEM_PROMPT
from app.schema.microservice import MicroserviceDesign
from app.state.desgin_state import DesignState
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node


parser = PydanticOutputParser(pydantic_object=MicroserviceDesign)


@timed_node("microservice_expert_agent")
@catch_agent_errors("microservice_expert_agent")
async def microservice_expert_agent(state: DesignState):

    microservice_prompt = ChatPromptTemplate.from_messages([
        ("system", MICROSERVICE_EXPERT_SYSTEM_PROMPT),
        ("human",
            "Requirements: {clarified_requirements}\n\n"
            "API Design (use this as the contract between services): {api_design}\n\n"
            "Produce the microservice design as JSON matching the schema.\n\n"
            "{format_instructions}"
         ),
    ]).partial(format_instructions=parser.get_format_instructions())

    microservice_chain = microservice_prompt | llm | parser

    result = await microservice_chain.ainvoke({
        "clarified_requirements": state["clarified_requirements"],
        "api_design": state["api_design"],
    })

    return Command(
        goto="supervisor",
        update={
            "microservice_design": result
        }
    )
