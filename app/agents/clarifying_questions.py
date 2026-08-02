import asyncio

from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command, interrupt

from app.prompts.clarifying_questions.v1 import CLARIFYING_QUESTIONS_SYSTEM_PROMPT, FOLLOWUP_ASSESSMENT_SYSTEM_PROMPT
from app.schema.clarification import ClarificationAssessment, ClarifyingQuestions
from app.state.desgin_state import DesignState
from app.utils.llm_factory import llm

questions_parser = PydanticOutputParser(pydantic_object=ClarifyingQuestions)
assessment_parser = PydanticOutputParser(
    pydantic_object=ClarificationAssessment)

questions_prompt = ChatPromptTemplate.from_messages([
    ("system", CLARIFYING_QUESTIONS_SYSTEM_PROMPT),
    ("human",
     "Product prompt: \"{user_query}\"\n\nGenerate the clarifying questions."),
])
questions_chain = questions_prompt | llm | questions_parser

assessment_prompt = ChatPromptTemplate.from_messages([
    ("system", FOLLOWUP_ASSESSMENT_SYSTEM_PROMPT),
    ("human",
     "Product prompt: \"{user_query}\"\n\nUser's answers so far:\n{answers}\n\nAssess if follow-up is needed."),
])
assessment_chain = assessment_prompt | llm | assessment_parser

MAX_CLARIFICATION_ROUNDS = 2


async def clarifying_questions_agent(state: DesignState):
    rounds = state['clarification_rounds']
    existing_clarification = state["user_clarifications"] or {}

    if rounds == 0:
        generated = await questions_chain.ainvoke({"user_query": state['user_query']})

        answers = interrupt({
            "message": "A few questions before I start the design:",
            "questions": generated.questions,
        })

        merged = {**existing_clarification, **answers}

        return Command(
            goto="clarifying_questions_agent",
            update={
                "user_clarifications": merged,
                "clarification_rounds": rounds + 1,
            }
        )

    if rounds < MAX_CLARIFICATION_ROUNDS:
        assessment = await assessment_chain.ainvoke({
            "user_query": state['user_query'],
            "answers": existing_clarification,
        })

        if assessment.needs_followup and assessment.followup_questions:
            followup_answers = interrupt({
                "message": "Just a couple follow-ups to make sure I get this right:",
                "questions": assessment.followup_questions,
            })
            merged = {**existing_clarification, **followup_answers}

            return Command(
                goto="clarifying_questions_agent",
                update={
                    "user_clarifications": merged,
                    "clarification_rounds": rounds + 1,
                }
            )

        return Command(
            goto="supervisor",
            update={"user_clarifications": existing_clarification}
        )

    return Command(
        goto="supervisor",
        update={"user_clarifications": existing_clarification}
    )
