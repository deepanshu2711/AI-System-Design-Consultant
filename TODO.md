# TODO

## Done
- Supervisor routing fixed — full sequential chain (clarifying questions → requirements → traffic → capacity → database/cache/queue → API → CDN/storage (conditional on media) → microservice → END) is now reachable end-to-end. (`app/agents/supervisor.py`)

## Not yet done
- **No tests.** No `tests/` directory, no pytest in `pyproject.toml`. Needs at least node-level unit tests (mocked LLM/tool calls) and a supervisor-routing test.
- **Empty README.md.** Needs run instructions and a project overview for anyone landing on the repo without CLAUDE.md context.
- **Parallel `Send()` fan-out** (e.g. traffic_estimator + capacity_planner, or db/cache/queue concurrently) was dropped in favor of sequential routing — worth revisiting later as a latency improvement; start fresh rather than reviving old comments.
- **Misnamed field:** `DesignState.queue_expert` (`app/state/desgin_state.py`) holds a `QueueDesign` — should probably be `queue_design` for consistency with sibling fields (`database_design`, `cache_design`, etc.). Cosmetic, touches multiple files if renamed.
- **No lint/format/CI.** No ruff, black, or CI configured.
