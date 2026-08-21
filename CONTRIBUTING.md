# Contributing

Thanks for considering a contribution. This is a small, actively-evolving project — please read this before opening a PR.

## Local setup

1. Install [uv](https://docs.astral.sh/uv/) and Python 3.12+.
2. Install and start [Ollama](https://ollama.com), then `ollama pull qwen2.5:3b` (the model is currently hardcoded in `app/utils/llm_factory.py`).
3. `uv sync` to install dependencies.
4. `uv run fastapi dev app/main.py` to run the server locally.

## Before you open a PR

- **There is no automated test suite yet** (no pytest, no CI). Verify your change by actually running the server and driving a `/design/start` → `/design/resume` flow through the affected agent(s). If you can't run it end-to-end, say so explicitly in the PR description rather than assuming it works.
- **There is no linter/formatter configured** (no ruff/black). Match the existing style in the file you're editing.
- Keep PRs focused on one thing — see the repo's [issues](../../issues) for a backlog of scoped, single-topic problems if you're looking for something to pick up.

## Code conventions

- **Don't "fix" these two misspelled paths** — they're intentional and other code imports from them exactly as spelled:
  - `app/grpahs/supervisor_graph.py` (not `graphs`)
  - `app/state/desgin_state.py` (not `design_state`)
- **Agent node pattern**: every file in `app/agents/` builds messages → binds tools → runs a tool-call loop capped by `MAX_TOOL_ITERATIONS` → forces a Pydantic-typed structured output → returns `Command(goto="supervisor", update={...})`. Agents never call each other directly; the supervisor is the only router. If you're adding a new agent, copy the shape of an existing one (`app/agents/traffic_estimator.py` is the most recently hardened reference) rather than inventing a new structure.
- **Prompts are versioned per agent** in `app/prompts/<agent_name>/v1.py`. If you're materially changing an existing agent's prompt, add a `v2.py` rather than editing `v1.py` in place.
- **Tool safety**: tools shared across agents live in `app/tools/`. If you add a tool that evaluates model-generated input (like `calculator.py`'s expression evaluator), it must not use unrestricted `eval`/`exec` — see `app/tools/calculator.py`'s AST-whitelist approach for the pattern to follow. Since user-supplied text flows into every agent's prompt, an unrestricted evaluator is a real prompt-injection-to-code-execution risk, not a theoretical one.

See [`CLAUDE.md`](./CLAUDE.md) for the fuller architectural picture and [`TODO.md`](./TODO.md) / the repo's issues for known gaps.

## Reporting bugs / requesting features

Open an issue. Include what you expected vs. what happened, and which agent/endpoint was involved.
