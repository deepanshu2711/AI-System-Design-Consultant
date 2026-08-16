from pydantic import BaseModel


class AgentError(BaseModel):
    node: str
    error_type: str
    message: str
    attempt_count: int


def make_agent_error(node: str, error_type: str, message: str, attempt_count: int) -> AgentError:
    return AgentError(
        node=node,
        error_type=error_type,
        message=message,
        attempt_count=attempt_count
    )
