import logging
import time
from functools import wraps

logger = logging.getLogger(__name__)


def timed_node(name: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start = time.perf_counter()

            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                elapsed = time.perf_counter() - start
                logger.info("%s: %.2fs", name, elapsed)

        return wrapper

    return decorator
