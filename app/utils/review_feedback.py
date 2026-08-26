from langchain_core.messages import HumanMessage

from app.state.desgin_state import DesignState


def revision_notice(state: DesignState, node_name: str) -> HumanMessage | None:
    feedback = state.get("review_feedback")
    if not feedback or feedback.approved:
        return None

    my_issues = [i for i in feedback.issues if i.target == node_name]
    if not my_issues:
        return None

    lines = "\n".join(
        f"- [{i.severity}] {i.description} Suggested fix: {i.suggested_fix}"
        for i in my_issues
    )
    return HumanMessage(
        content=(
            "ARCHITECTURE REVIEW FEEDBACK — the architecture reviewer flagged "
            "issues with your previous design. Revise it to address these:\n"
            f"{lines}"
        )
    )
