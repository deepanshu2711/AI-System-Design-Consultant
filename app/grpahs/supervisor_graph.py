from langgraph.graph import START, StateGraph

from app.agents.requirement_analyzer import requirement_analyzer_agent
from app.state.desgin_state import DesignState


def build_supervisor_graph():
    supervisor_graph = StateGraph(DesignState)

    supervisor_graph.add_node(
        "requirement_analyzer_agent", requirement_analyzer_agent)

    supervisor_graph.add_edge(START, "requirement_analyzer_agent")

    return supervisor_graph.compile()


supervisor_graph = build_supervisor_graph()
