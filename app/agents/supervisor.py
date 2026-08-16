import asyncio

from langgraph.graph import END

from app.state.desgin_state import DesignState
from langgraph.types import Command, Send
from app.utils.timing import timed_node


@timed_node("supervisor")
async def supervisor(state: DesignState):
    if not state['user_clarifications']:
        return Command(goto="clarifying_questions_agent")
    if not state['clarified_requirements']:
        return Command(goto="requirement_analyzer_agent")

    traffic_ready = bool(state['traffic_estimates'])
    capacity_ready = bool(state['capacity_plan'])

    if not traffic_ready and not capacity_ready:
        return Command(
            goto=[
                Send("traffic_estimator_agent", state),
                Send("capacity_planner_agent", state)
            ]
        )
    if not state['traffic_estimates']:
        return Command(goto="traffic_estimator_agent")
    if not state['capacity_plan']:
        return Command(goto="capacity_planner_agent")

    database_ready = bool(state['database_design'])
    cache_ready = bool(state['cache_design'])
    queue_ready = bool(state['queue_expert'])

    if not database_ready and not cache_ready and not queue_ready:
        return Command(
            goto=[
                Send('database_designer_agent', state),
                Send('cache_expert_agent', state),
                Send('queue_expert_agent', state)
            ]
        )

    if not state['database_design']:
        return Command(goto="database_designer_agent")

    if not state['cache_design']:
        return Command(goto="cache_expert_agent")

    if not state['queue_expert']:
        return Command(goto="queue_expert_agent")

    if not state['api_design']:
        return Command(goto='api_designer_agent')

    requirements = state.get('clarified_requirements')
    needs_media = getattr(requirements, 'involves_media_content', False)

    cdn_ready = bool(state['cdn_design'])
    storage_ready = bool(state['storage_design'])

    if needs_media and not cdn_ready and not storage_ready:
        return Command(goto=[
            Send("cdn_expert_agent", state),
            Send("storage_expert_agent", state),
        ])

    if needs_media and not cdn_ready:
        return Command(goto="cdn_expert_agent")

    if needs_media and not storage_ready:
        return Command(goto="storage_expert_agent")

    if not state['microservice_design']:
        return Command(goto="microservice_expert_agent")

    return Command(goto=END)
