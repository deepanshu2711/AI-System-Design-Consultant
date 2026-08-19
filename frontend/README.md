# AI System Design Consultant — frontend

Vite + React UI for the LangGraph multi-agent backend in `../app`.

## Running

Backend (needs a local Ollama daemon with `qwen2.5:3b` pulled — see the root `CLAUDE.md`):

```
uv run fastapi dev app/main.py
```

Frontend:

```
npm install
npm run dev
```

By default the frontend calls the backend at `http://localhost:8000`. Override with a `.env`
file (see `.env.example`) setting `VITE_API_BASE_URL`.

## Flow

Query → clarifying questions (possibly multiple rounds — the backend can ask follow-ups) →
agent pipeline runs → results dashboard. `src/api/designApi.js` calls `POST /design/start` and
`POST /design/resume`; `src/components/AgentGraph.jsx` visualizes the supervisor's routing
(`app/agents/supervisor.py`) while a request is in flight.
