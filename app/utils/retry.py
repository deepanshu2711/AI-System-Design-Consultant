from langgraph.types import RetryPolicy


def default_retry_policy(max_attempts: int = 3):
    return RetryPolicy(
        max_attempts=max_attempts,
        initial_interval=0.5,
        backoff_factor=2.0,
        max_interval=10.0,
    )
