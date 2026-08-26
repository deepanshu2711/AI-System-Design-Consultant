from langgraph.graph import START, StateGraph
from langgraph.checkpoint.memory import MemorySaver

from app.agents.api_designer import api_designer_agent
from app.agents.cache_expert import cache_expert_agent
from app.agents.capacity_planner import capacity_planner_agent
from app.agents.cdn_expert import cdn_expert_agent
from app.agents.database_designer import database_designer_agent
from app.agents.microservice_expert import microservice_expert_agent
from app.agents.queue_expert import queue_expert_agent
from app.agents.storage_expert import storage_expert_agent
from app.agents.supervisor import supervisor
from app.graphs.review_subgraph import review_subgraph
from app.agents.clarifying_questions import clarifying_questions_agent
from app.agents.requirement_analyzer import requirement_analyzer_agent
from app.agents.traffic_estimator import traffic_estimator_agent
from app.state.desgin_state import DesignState
from app.utils.retry import default_retry_policy


def build_supervisor_graph():
    supervisor_graph = StateGraph(DesignState)

    # NOTE: NODES
    supervisor_graph.add_node("supervisor", supervisor)
    supervisor_graph.add_node(
        "requirement_analyzer_agent", requirement_analyzer_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        "clarifying_questions_agent", clarifying_questions_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'traffic_estimator_agent', traffic_estimator_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'capacity_planner_agent', capacity_planner_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'database_designer_agent', database_designer_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'cache_expert_agent', cache_expert_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'queue_expert_agent', queue_expert_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'api_designer_agent', api_designer_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'cdn_expert_agent', cdn_expert_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'storage_expert_agent', storage_expert_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'microservice_expert_agent', microservice_expert_agent, retry_policy=default_retry_policy())
    supervisor_graph.add_node(
        'architecture_review_cycle', review_subgraph)

    # NOTE: EDGES
    supervisor_graph.add_edge(START, "supervisor")

    checkpointer = MemorySaver()

    return supervisor_graph.compile(
        checkpointer=checkpointer
    )


supervisor_graph = build_supervisor_graph()
