import httpx
from langgraph.types import RetryPolicy
from langchain_core.exceptions import OutputParserException
from ollama import ResponseError
from pydantic import ValidationError

# Errors worth retrying: transient infra failures talking to Ollama, or the
# model producing output that failed to parse/validate (may succeed on a
# re-sample). Anything else (bad state, programming bugs) is not retryable.
RETRYABLE_ERRORS = (
    httpx.TransportError,
    ResponseError,
    OutputParserException,
    ValidationError,
)


def default_retry_policy(max_attempts: int = 3):
    return RetryPolicy(
        max_attempts=max_attempts,
        initial_interval=0.5,
        backoff_factor=2.0,
        max_interval=10.0,
        retry_on=RETRYABLE_ERRORS,
    )
