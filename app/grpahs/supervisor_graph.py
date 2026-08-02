from langgraph.graph import START, StateGraph
from langgraph.checkpoint.memory import MemorySaver

from app.agents.supervisor import supervisor
from app.agents.clarifying_questions import clarifying_questions_agent
from app.agents.requirement_analyzer import requirement_analyzer_agent
from app.state.desgin_state import DesignState


def build_supervisor_graph():
    supervisor_graph = StateGraph(DesignState)

    # NOTE: NODES
    supervisor_graph.add_node("supervisor", supervisor)
    supervisor_graph.add_node(
        "requirement_analyzer_agent", requirement_analyzer_agent)
    supervisor_graph.add_node(
        "clarifying_questions_agent", clarifying_questions_agent)

    # NOTE: EDGES
    supervisor_graph.add_edge(START, "supervisor")

    checkpointer = MemorySaver()

    return supervisor_graph.compile(
        checkpointer=checkpointer
    )


supervisor_graph = build_supervisor_graph()
