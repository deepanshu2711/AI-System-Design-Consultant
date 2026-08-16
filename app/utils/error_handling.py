from functools import wraps

from langgraph.errors import GraphBubbleUp
from langgraph.types import Command

from app.schema.error import make_agent_error
from app.utils.retry import RETRYABLE_ERRORS


def catch_agent_errors(node_name: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(state, *args, **kwargs):
            try:
                return await func(state, *args, **kwargs)
            except RETRYABLE_ERRORS:
                # Let LangGraph's RetryPolicy retry these; only record an
                # AgentError once retries are exhausted and this propagates
                # past the graph invocation (see app/main.py).
                raise
            except GraphBubbleUp:
                # LangGraph's own control flow (interrupt(), etc.) - must
                # propagate untouched, not be recorded as an agent error.
                raise
            except Exception as exc:
                prior_attempts = sum(
                    1 for e in (state.get("errors") or []) if e.node == node_name
                )
                agent_error = make_agent_error(
                    node=node_name,
                    error_type=type(exc).__name__,
                    message=str(exc),
                    attempt_count=prior_attempts + 1,
                )
                return Command(goto="supervisor", update={"errors": [agent_error]})

        return wrapper

    return decorator
