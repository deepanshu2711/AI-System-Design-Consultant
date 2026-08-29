from langchain_core.prompts import ChatPromptTemplate
from langgraph.types import Command

from app.prompts.architecture_reviewer.v1 import ARCHITECTURE_REVIEWER_SYSTEM_PROMPT
from app.schema.review import ReviewFeedback
from app.state.desgin_state import DesignState
from app.utils.constants import MAX_REVIEW_ITERATIONS
from app.utils.error_handling import catch_agent_errors
from app.utils.llm_factory import build_llm
from app.utils.timing import timed_node

llm_structured = build_llm(num_ctx=16384, num_predict=3072, timeout=300)
llm_with_structure = llm_structured.with_structured_output(ReviewFeedback)

prompt = ChatPromptTemplate.from_messages([
    ("system", ARCHITECTURE_REVIEWER_SYSTEM_PROMPT),
    ("human",
     "Clarified requirements:\n{clarified_requirements}\n\n"
     "Traffic estimates:\n{traffic_estimates}\n\n"
     "Capacity plan:\n{capacity_plan}\n\n"
     "Database design:\n{database_design}\n\n"
     "Cache design:\n{cache_design}\n\n"
     "Queue design:\n{queue_design}\n\n"
     "API design:\n{api_design}\n\n"
     "Review this design end-to-end using the rubric. Produce structured "
     "review feedback."),
])

REVISE_NODE_FOR_TARGET = {
    "database_designer_agent": "revise_database_designer_agent",
    "cache_expert_agent": "revise_cache_expert_agent",
    "queue_expert_agent": "revise_queue_expert_agent",
    "api_designer_agent": "revise_api_designer_agent",
}


@timed_node("architecture_reviewer_agent")
@catch_agent_errors("architecture_reviewer_agent")
async def architecture_reviewer_agent(state: DesignState):
    iterations = state.get("review_iterations", 0)

    messages = prompt.format_messages(
        clarified_requirements=state.get("clarified_requirements"),
        traffic_estimates=state.get("traffic_estimates") or "Not available",
        capacity_plan=state.get("capacity_plan") or "Not available",
        database_design=state.get("database_design") or "Not available",
        cache_design=state.get("cache_design") or "Not available",
        queue_design=state.get("queue_expert") or "Not available",
        api_design=state.get("api_design") or "Not available",
    )

    feedback = await llm_with_structure.ainvoke(messages)
    iterations += 1

    if feedback.approved or iterations >= MAX_REVIEW_ITERATIONS:
        return Command(
            goto="supervisor",
            update={"review_feedback": feedback,
                    "review_iterations": iterations},
            graph=Command.PARENT,
        )

    blockers = [i for i in feedback.issues if i.severity == "blocker"]
    target_issue = blockers[0] if blockers else feedback.issues[0]

    return Command(
        goto=REVISE_NODE_FOR_TARGET[target_issue.target],
        update={"review_feedback": feedback, "review_iterations": iterations},
    )
