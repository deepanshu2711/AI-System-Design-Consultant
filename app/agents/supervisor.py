from langgraph.graph import END

from app.state.desgin_state import DesignState
from langgraph.types import Command
from app.utils.constants import MAX_AGENT_FAILURES, MAX_REVIEW_ITERATIONS
from app.utils.timing import timed_node


def _route_if_healthy(state: DesignState, node_name: str):
    failures = sum(1 for error in (state.get("errors") or [])
                   if error.node == node_name)
    if failures >= MAX_AGENT_FAILURES:
        return Command(goto=END, update={"run_status": "failed"})
    return Command(goto=node_name)


@timed_node("supervisor")
async def supervisor(state: DesignState):
    if not state['user_clarifications']:
        return _route_if_healthy(state, "clarifying_questions_agent")
    if not state['clarified_requirements']:
        return _route_if_healthy(state, "requirement_analyzer_agent")
    if not state['traffic_estimates']:
        return _route_if_healthy(state, "traffic_estimator_agent")
    if not state['capacity_plan']:
        return _route_if_healthy(state, "capacity_planner_agent")
    if not state['database_design']:
        return _route_if_healthy(state, "database_designer_agent")
    if not state['cache_design']:
        return _route_if_healthy(state, "cache_expert_agent")
    if not state['queue_expert']:
        return _route_if_healthy(state, "queue_expert_agent")
    if not state['api_design']:
        return _route_if_healthy(state, "api_designer_agent")

    requirements = state.get('clarified_requirements')
    needs_media = getattr(requirements, 'involves_media_content', False)

    if needs_media and not state['cdn_design']:
        return _route_if_healthy(state, "cdn_expert_agent")
    if needs_media and not state['storage_design']:
        return _route_if_healthy(state, "storage_expert_agent")

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
