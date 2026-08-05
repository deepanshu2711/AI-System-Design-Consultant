import asyncio

from langgraph.graph import END

from app.state.desgin_state import DesignState
from langgraph.types import Command, Send


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

    if not state['database_design']:
        return Command(goto="database_designer_agent")

    return Command(goto=END)
