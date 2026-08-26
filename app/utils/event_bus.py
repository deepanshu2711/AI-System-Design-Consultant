import asyncio

_CHANNELS: dict[str, asyncio.Queue] = {}
_LAST_TERMINAL: dict[str, dict] = {}

_SENTINEL = None


def _get_or_create(thread_id: str) -> asyncio.Queue:
    queue = _CHANNELS.get(thread_id)
    if queue is None:
        queue = asyncio.Queue()
        _CHANNELS[thread_id] = queue
    return queue


async def publish(thread_id: str, event: dict) -> None:
    await _get_or_create(thread_id).put(event)
    if event.get("type") == "terminal":
        _LAST_TERMINAL[thread_id] = event


def subscribe(thread_id: str) -> asyncio.Queue:
    """Returns a queue to read events from for this thread.

    If a run for this thread is in flight (or hasn't started yet), returns
    the shared channel — the same queue `publish` writes to, whichever of
    the two callers gets there first. If the run already finished before
    this call, returns a fresh one-off queue pre-seeded with the cached
    terminal event so a late subscriber still gets a result instead of
    hanging forever.
    """
    if thread_id in _CHANNELS:
        return _CHANNELS[thread_id]
    cached = _LAST_TERMINAL.get(thread_id)
    if cached is not None:
        queue: asyncio.Queue = asyncio.Queue()
        queue.put_nowait(cached)
        queue.put_nowait(_SENTINEL)
        return queue
    return _get_or_create(thread_id)


def close(thread_id: str) -> None:
    queue = _CHANNELS.pop(thread_id, None)
    if queue is not None:
        queue.put_nowait(_SENTINEL)
