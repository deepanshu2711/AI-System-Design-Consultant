from langgraph.graph import END

from app.state.desgin_state import DesignState
from langgraph.types import Command, Send
from app.utils.constants import MAX_AGENT_FAILURES, MAX_REVIEW_ITERATIONS
from app.utils.timing import timed_node


CAPACITY_STAGE = {
    "database_design": "database_designer_agent",
    "capacity_plan": "capacity_planner_agent",
}

INFRA_STAGE = {
    "cache_design": "cache_expert_agent",
    "queue_expert": "queue_expert_agent",
    "api_design": "api_designer_agent"
}

MEDIA_STAGE = {
    "cdn_design": "cdn_expert_agent",
    "storage_design": "storage_expert_agent"
}


def _failure_count(state: DesignState, node_name: str) -> int:
    return sum(1 for error in (state.get('errors') or []) if error.node == node_name)


def _is_exausted(state: DesignState, node_name: str) -> bool:
    return _failure_count(state, node_name) >= MAX_AGENT_FAILURES


def _route_if_healthy(state: DesignState, node_name: str):
    if _is_exausted(state, node_name):
        return Command(goto=END, update={"run_status": "failed"})
    return Command(goto=node_name)


def _fanout_if_healthy(state: DesignState, stage: dict[str, str]):
    pending = [node for field, node in stage.items() if not state.get(field)]

    if not pending:
        return None

    exausted = [node for node in pending if _is_exausted(state, node)]
    if (exausted):
        return Command(goto=END, update={"run_status": "failed"})

    return Command(goto=[Send(node, state) for node in pending])


@timed_node("supervisor")
async def supervisor(state: DesignState):
    if not state['user_clarifications']:
        return _route_if_healthy(state, "clarifying_questions_agent")
    if not state['clarified_requirements']:
        return _route_if_healthy(state, "requirement_analyzer_agent")
    if not state['traffic_estimates']:
        return _route_if_healthy(state, "traffic_estimator_agent")

    capacity_command = _fanout_if_healthy(state, CAPACITY_STAGE)
    if capacity_command is not None:
        return capacity_command

    infra_command = _fanout_if_healthy(state, INFRA_STAGE)
    if infra_command is not None:
        return infra_command

    requirements = state.get('clarified_requirements')
    needs_media = getattr(requirements, 'involves_media_content', False)

    media_command = _fanout_if_healthy(state, MEDIA_STAGE)
    if media_command is not None and needs_media:
        return media_command

    if not state['microservice_design']:
        return _route_if_healthy(state, "microservice_expert_agent")

    review_feedback = state.get('review_feedback')
    review_iterations = state.get('review_iterations', 0)
    review_settled = review_feedback is not None and (
        review_feedback.approved or review_iterations >= MAX_REVIEW_ITERATIONS
    )
    if not review_settled:
        return _route_if_healthy(state, "architecture_review_cycle")

    return Command(goto=END)
