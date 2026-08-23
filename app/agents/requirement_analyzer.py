from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command
from app.schema.requirements import RequirementSpec
from app.state.desgin_state import DesignState
from app.prompts.requirement_analyzer.v1 import FEW_SHOT_EXAMPLES, REQUIREMENT_ANALYZER_SYSTEM_PROMPT
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import llm
from app.utils.timing import timed_node


parser = PydanticOutputParser(pydantic_object=RequirementSpec)


@timed_node("requirement_analyzer_agent")
@catch_agent_errors("requirement_analyzer_agent")
async def requirement_analyzer_agent(state: DesignState):
    requirement_analyzer_prompt = ChatPromptTemplate.from_messages([
        ("system", REQUIREMENT_ANALYZER_SYSTEM_PROMPT + FEW_SHOT_EXAMPLES),
        ("human",
            "User query: \"{user_query}\"\n\n"
            "User clarifications (if any): {user_clarifications}\n\n"
            "Produce the requirement specification as JSON matching the schema."
         ),
    ])

    requirement_analyzer_chain = requirement_analyzer_prompt | llm | parser

    result = await requirement_analyzer_chain.ainvoke({
        "user_query": state['user_query'],
        "user_clarifications": state['user_clarifications'] or "None Provided"
    })

    return Command(
        goto="supervisor",
        update={
            "clarified_requirements": result
        }
    )
