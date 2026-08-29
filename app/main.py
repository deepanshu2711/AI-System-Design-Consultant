from app.utils.retry import RETRYABLE_ERRORS
from app.utils.helpers import format_response
from app.utils import event_bus
from app.schema.design import ResumeDesignRequest, StartDesignRequest
from app.grpahs.supervisor_graph import supervisor_graph
from langgraph.types import Command
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
import json
import uuid
from dotenv import load_dotenv

load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:3000", "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Node names registered in app/grpahs/supervisor_graph.py — used to filter
# astream_events noise (LLM/tool sub-events) down to node-level progress.
# "supervisor" is deliberately excluded: it's the router/hub, not a stage
# the UI shows progress for.
KNOWN_NODES = {
    "clarifying_questions_agent",
    "requirement_analyzer_agent",
    "traffic_estimator_agent",
    "capacity_planner_agent",
    "database_designer_agent",
    "cache_expert_agent",
    "queue_expert_agent",
    "api_designer_agent",
    "cdn_expert_agent",
    "storage_expert_agent",
    "microservice_expert_agent",
    "architecture_review_cycle",
}


@app.get("/")
def welcome():
    return {"message": "Welcome to AI System Design Condultant"}


async def run_and_stream(thread_id: str, graph_input, config: dict) -> dict:
    try:
        async for event in supervisor_graph.astream_events(graph_input, config, version="v2"):
            name = event.get("name")
            kind = event.get("event")
            if name not in KNOWN_NODES:
                continue
            if kind == "on_chain_start":
                await event_bus.publish(thread_id, {"type": "node_start", "node": name})
            elif kind == "on_chain_end":
                await event_bus.publish(thread_id, {"type": "node_end", "node": name})

        snapshot = await supervisor_graph.aget_state(config)
        result = dict(snapshot.values)
        if snapshot.interrupts:
            result["__interrupt__"] = list(snapshot.interrupts)
        payload = format_response(thread_id, result)
    except RETRYABLE_ERRORS as exc:
        payload = {
            "status": "error",
            "thread_id": thread_id,
            "message": f"Design run failed after retries: {exc}",
        }
        await event_bus.publish(thread_id, {"type": "terminal", **payload})
        event_bus.close(thread_id)
        raise HTTPException(
            status_code=502, detail=payload["message"]) from exc

    await event_bus.publish(thread_id, {"type": "terminal", **payload})
    event_bus.close(thread_id)
    return payload


@app.post('/design/start')
async def start_design(req: StartDesignRequest):
    thread_id = req.thread_id or str(uuid.uuid4())
    print('start design thread id', thread_id)
    return await run_and_stream(
        thread_id,
        {
            "user_query": req.user_query,
            "messages": None,
            "clarified_requirements": None,
            "user_clarifications": None,
            "clarification_rounds": 0,
            "traffic_estimates": None,
            "capacity_plan": None,
            "database_design": None,
            "cache_design": None,
            "queue_expert": None,
            "cdn_design": None,
            "storage_design": None,
            "api_design": None,
            "microservice_design": None,
            "review_feedback": None,
            "review_iterations": 0,
            "errors": None
        },
        {"configurable": {"thread_id": thread_id}},
    )


@app.post("/design/resume")
async def resume_design(req: ResumeDesignRequest):
    print('thread_id in resume', req.thread_id)
    return await run_and_stream(
        req.thread_id,
        Command(resume=req.answers),
        {"configurable": {"thread_id": req.thread_id}},
    )


@app.get("/design/state/{thread_id}")
async def get_design_state(thread_id: str):
    cached = event_bus.get_last_terminal(thread_id)
    if cached is None:
        raise HTTPException(
            status_code=404, detail="No finished run for this thread_id")
    payload = {k: v for k, v in cached.items() if k != "type"}
    return jsonable_encoder(payload)


@app.get("/design/stream/{thread_id}")
async def stream_design(thread_id: str):
    async def event_generator():
        queue = event_bus.subscribe(thread_id)
        while True:
            event = await queue.get()
            if event is None:
                break
            # `event` may carry Pydantic model instances (e.g. a completed
            # run's `state`) — encode the same way FastAPI would for a
            # normal JSON response before json.dumps, which can't handle
            # them directly.
            yield f"data: {json.dumps(jsonable_encoder(event))}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
