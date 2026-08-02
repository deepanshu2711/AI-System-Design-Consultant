import asyncio

from langgraph.graph import END

from app.state.desgin_state import DesignState
from langgraph.types import Command


async def supervisor(state: DesignState):
    # if not state['user_clarifications']:
    #     return Command(goto="clarifying_questions_agent")
    if not state['clarified_requirements']:
        return Command(goto="requirement_analyzer_agent")
    if not state['traffic_estimates']:
        return Command(goto="traffic_estimator_agent")

    return Command(goto=END)
