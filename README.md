# AI System Design Consultant

**Turn "design Instagram" into an industry-grade system design document — entirely offline, no API keys.**

A supervisor-and-worker [LangGraph](https://www.langchain.com/langgraph) application that runs an automated system-design "interview." Give it a prompt like *"design Instagram"* and a supervisor node routes a shared design state through a chain of specialist LLM agents — clarifying questions, requirement analysis, traffic estimation, capacity planning, database/cache/queue/CDN/storage design, API design, microservices — each producing a typed design artifact, until the whole document is assembled.

All agents share a single local model served by [Ollama](https://ollama.com) via `langchain-ollama` — nothing leaves your machine, and there's no external LLM API required.

<!--
TODO: replace this with a real demo. A short GIF or terminal recording showing
a POST /design/start call and the resulting design doc converts far better
than any amount of text. Tools like asciinema, vhs, or a simple screen
recording all work.

![demo](./docs/demo.gif)
-->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![LangGraph](https://img.shields.io/badge/built%20with-LangGraph-1C3C3C.svg)](https://www.langchain.com/langgraph)
[![Ollama](https://img.shields.io/badge/runs%20on-Ollama-000000.svg)](https://ollama.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## Why this exists

System design interviews and real architecture reviews follow a repeatable shape: clarify requirements, estimate scale, pick a data model, work through caching/queues/CDN, sketch the API, then the services. Most LLM wrappers try to do this in one shot with one giant prompt and produce something shallow. This project instead models it as what it actually is — a pipeline of specialists handing off a shared state, each one focused and typed — and runs it entirely on a local model so it's free to experiment with and doesn't ship your design questions to a third party.

## Features

- **Multi-agent pipeline** — a supervisor routes a shared `DesignState` through specialist agents (requirements, traffic estimation, capacity planning, database/cache/queue/CDN/storage, API design, microservices), each producing a typed, structured artifact.
- **Fully local** — runs on Ollama, so there's no API key, no rate limit, and no data leaving your machine.
- **Human-in-the-loop** — the flow can pause for clarifying questions and resume once you answer them.
- **Typed outputs** — every agent is forced into a Pydantic-structured response, so the assembled document is consistent rather than freeform text.
- **Tool-using agents** — agents can call bound tools (e.g. a sandboxed calculator) in a capped tool-calling loop before producing their final artifact.

## How it works

```
            ┌─────────────┐
   ┌───────▶│  supervisor │◀───────┐
   │        └──────┬──────┘        │
   │               │ routes to next│
   │        empty field in state   │
   │               ▼               │
   │   ┌───────────────────────┐   │
   │   │   specialist agent     │  │
   │   │  (requirements, traffic,│ │
   │   │   capacity, DB/cache/  │  │
   │   │   queue/CDN, API, ...) │──┘
   │   └───────────┬────────────┘
   │               │ writes typed artifact
   │               ▼
   └────────  DesignState  ────────▶ assembled design doc
```

- A `StateGraph` (`app/grpahs/supervisor_graph.py`) holds a shared `DesignState` (`app/state/desgin_state.py`).
- `supervisor` (`app/agents/supervisor.py`) is the sole router: it inspects which fields of the state are still empty and dispatches to the next specialist agent.
- Each specialist agent (`app/agents/*.py`) follows the same shape: build a prompt from state → bind tools (e.g. a sandboxed calculator) → run a capped tool-calling loop → force a Pydantic-typed structured output → hand control back to the supervisor.
- Agents never call each other directly — every transition goes back through the supervisor.
- System prompts are versioned per agent under `app/prompts/<agent_name>/v1.py`.

See [`CLAUDE.md`](./CLAUDE.md) for the full architectural notes (including two intentional file/module misspellings that other code depends on — don't "fix" those paths without updating every import).

## Status

This is an active work-in-progress, not a finished product. Known gaps are tracked in [`TODO.md`](./TODO.md) and in the repo's [issues](../../issues) — notably, there's no automated test suite yet, so please verify changes manually against a running instance.

Looking for a way to help out? Issues tagged [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) are a good place to start — see [Contributing](#contributing) below.

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
cp .env.example .env # optional: fill in LangSmith tracing keys if you want traces
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

## Roadmap

- [ ] Automated test suite
- [ ] Env var override for the Ollama model
- [ ] Persistent checkpointing (swap `MemorySaver` for a durable store)
- [ ] Export assembled design doc to Markdown/PDF

See [`TODO.md`](./TODO.md) for the full list.

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for local setup, conventions, and what to know before opening a PR. If you build something with this or find it useful, a star helps others find it too.

## License

[MIT](./LICENSE)
