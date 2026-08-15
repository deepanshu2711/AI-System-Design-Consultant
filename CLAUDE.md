# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A FastAPI + LangGraph multi-agent system that conducts an automated system-design "interview": a supervisor node routes a shared `DesignState` through specialist LLM agents (clarifying questions, requirement analysis, traffic estimation, capacity planning, database/cache/queue/CDN/storage/API design), each emitting a Pydantic-typed design artifact. All agents share one local Ollama model via `langchain-ollama`.

## Running it

```
uv run fastapi dev app/main.py
```

Requires a local Ollama daemon running with `qwen2.5:3b` pulled — the model is hardcoded in `app/utils/llm_factory.py` (no env var override). There is no Docker setup; Ollama must be installed and running on the dev machine.

Endpoints: `POST /design/start` kicks off a new graph run; `POST /design/resume` resumes an interrupted run (human-in-the-loop clarification) via LangGraph's `Command(resume=...)`. Checkpointing is in-memory (`MemorySaver`) only — state does not survive a process restart.

## Load-bearing typos — do not "fix" these paths

- `app/grpahs/supervisor_graph.py` (not `graphs`)
- `app/state/desgin_state.py` (not `design_state`)

These misspellings are intentional-for-now and other code imports from these exact paths. Renaming them will break imports across the codebase.

## Agent node pattern

Every file in `app/agents/` follows the same shape: build messages → bind tools → tool-call loop capped by `MAX_TOOL_ITERATIONS` → force final structured output → `return Command(goto="supervisor", update={...})`. The supervisor (`app/agents/supervisor.py`) is the sole router; agents never call each other directly. System prompts live in `app/prompts/<agent_name>/v1.py` (versioned per agent — bump to `v2.py` etc. rather than editing `v1` in place if iterating on a prompt). Tools shared across agents live in `app/tools/` (`calculator.py`, `json_formatter.py`).

## Current WIP state

The supervisor's parallel `Send()` fan-out (dispatching multiple agents concurrently, e.g. traffic_estimator + capacity_planner) is being reworked and is currently commented out in favor of sequential routing — several agent branches (capacity_planner, api_designer, cdn_expert, storage_expert) are temporarily unreachable from the supervisor even though their node functions exist. This is active in-progress work, not dead code — don't remove the commented-out branches without checking in first.

## No test/lint tooling yet

There is no pytest, ruff, black, or CI configured. Don't assume any of these commands work.
