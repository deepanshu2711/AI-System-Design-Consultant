from langgraph.graph import END

from app.state.desgin_state import DesignState
from langgraph.types import Command
from app.utils.timing import timed_node


@timed_node("supervisor")
async def supervisor(state: DesignState):
    if not state['user_clarifications']:
        return Command(goto="clarifying_questions_agent")
    if not state['clarified_requirements']:
        return Command(goto="requirement_analyzer_agent")
    if not state['traffic_estimates']:
        return Command(goto="traffic_estimator_agent")
    if not state['capacity_plan']:
        return Command(goto="capacity_planner_agent")
    if not state['database_design']:
        return Command(goto="database_designer_agent")
    if not state['cache_design']:
        return Command(goto="cache_expert_agent")
    if not state['queue_expert']:
        return Command(goto="queue_expert_agent")
    if not state['api_design']:
        return Command(goto="api_designer_agent")

    requirements = state.get('clarified_requirements')
    needs_media = getattr(requirements, 'involves_media_content', False)

    if needs_media and not state['cdn_design']:
        return Command(goto="cdn_expert_agent")
    if needs_media and not state['storage_design']:
        return Command(goto="storage_expert_agent")

    if not state['microservice_design']:
        return Command(goto="microservice_expert_agent")

    return Command(goto=END)
