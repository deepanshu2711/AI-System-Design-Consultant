# AI System Design Consultant

A supervisor-and-worker [LangGraph](https://www.langchain.com/langgraph) application that runs an automated system-design "interview." Give it a prompt like *"design Instagram"* and a supervisor node routes a shared design state through a chain of specialist LLM agents — clarifying questions, requirement analysis, traffic estimation, capacity planning, database/cache/queue/CDN/storage design, API design, microservices — each producing a typed design artifact, until the whole document is assembled.

All agents share a single local model served by [Ollama](https://ollama.com) via `langchain-ollama` — no external LLM API required.

## How it works

- A `StateGraph` (`app/grpahs/supervisor_graph.py`) holds a shared `DesignState` (`app/state/desgin_state.py`).
- `supervisor` (`app/agents/supervisor.py`) is the sole router: it inspects which fields of the state are still empty and dispatches to the next specialist agent.
- Each specialist agent (`app/agents/*.py`) follows the same shape: build a prompt from state → bind tools (e.g. a sandboxed calculator) → run a capped tool-calling loop → force a Pydantic-typed structured output → hand control back to the supervisor.
- Agents never call each other directly — every transition goes back through the supervisor.
- System prompts are versioned per agent under `app/prompts/<agent_name>/v1.py`.

See [`CLAUDE.md`](./CLAUDE.md) for the full architectural notes (including two intentional file/module misspellings that other code depends on — don't "fix" those paths without updating every import).

## Status

This is an active work-in-progress, not a finished product. Known gaps are tracked in [`TODO.md`](./TODO.md) and in the repo's [issues](../../issues) — notably, there's no automated test suite yet, so please verify changes manually against a running instance.

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) for dependency management
- [Ollama](https://ollama.com) installed and running locally, with the model pulled:
  ```bash
  ollama pull qwen2.5:3b
  ```
  The model is currently hardcoded in `app/utils/llm_factory.py` (no env var override yet).

## Setup

```bash
git clone https://github.com/deepanshu2711/AI-System-Design-Consultant.git
cd AI-System-Design-Consultant
uv sync
cp .env.example .env  # optional: fill in LangSmith tracing keys if you want traces
```

## Running it

Make sure the Ollama daemon is running, then:

```bash
uv run fastapi dev app/main.py
```

### API

- `POST /design/start` — kicks off a new design run.
  ```json
  { "user_query": "Design a system like Instagram" }
  ```
- `POST /design/resume` — resumes an interrupted run (human-in-the-loop clarification) with your answers.
  ```json
  { "thread_id": "<thread_id from /design/start>", "answers": { "...": "..." } }
  ```

Checkpointing is in-memory only (`MemorySaver`) — state does not survive a process restart.

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for local setup, conventions, and what to know before opening a PR.

## License

[MIT](./LICENSE)
