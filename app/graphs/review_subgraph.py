from langgraph.graph import START, StateGraph
from langgraph.types import Command

from app.agents.api_designer import api_designer_agent
from app.agents.architecture_reviewer import architecture_reviewer_agent
from app.agents.cache_expert import cache_expert_agent
from app.agents.database_designer import database_designer_agent
from app.agents.queue_expert import queue_expert_agent
from app.state.desgin_state import DesignState
from app.utils.retry import default_retry_policy


async def revise_database_designer_agent(state: DesignState):
    command = await database_designer_agent(state)
    return Command(goto="architecture_reviewer_agent", update=command.update)


async def revise_cache_expert_agent(state: DesignState):
    command = await cache_expert_agent(state)
    return Command(goto="architecture_reviewer_agent", update=command.update)


async def revise_queue_expert_agent(state: DesignState):
    command = await queue_expert_agent(state)
    return Command(goto="architecture_reviewer_agent", update=command.update)


async def revise_api_designer_agent(state: DesignState):
    command = await api_designer_agent(state)
    return Command(goto="architecture_reviewer_agent", update=command.update)


def build_review_subgraph():
    graph = StateGraph(DesignState)

    graph.add_node("architecture_reviewer_agent", architecture_reviewer_agent)
    graph.add_node("revise_database_designer_agent", revise_database_designer_agent,
                    retry_policy=default_retry_policy())
    graph.add_node("revise_cache_expert_agent", revise_cache_expert_agent,
                    retry_policy=default_retry_policy())
    graph.add_node("revise_queue_expert_agent", revise_queue_expert_agent,
                    retry_policy=default_retry_policy())
    graph.add_node("revise_api_designer_agent", revise_api_designer_agent,
                    retry_policy=default_retry_policy())

    graph.add_edge(START, "architecture_reviewer_agent")

    return graph.compile()


review_subgraph = build_review_subgraph()
