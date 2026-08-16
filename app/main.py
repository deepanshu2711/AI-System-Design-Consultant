import asyncio
import uuid

from fastapi import FastAPI, HTTPException
from langgraph.types import Command

from app.grpahs.supervisor_graph import supervisor_graph
from app.schema.design import ResumeDesignRequest, StartDesignRequest
from app.utils.helpers import format_response
from app.utils.retry import RETRYABLE_ERRORS

app = FastAPI()


@app.get("/")
def welcome():
    return {"message": "Welcome to AI System Design Condultant"}


@app.post('/design/start')
async def start_design(req: StartDesignRequest):
    thread_id = str(uuid.uuid4())
    print('start design thread id', thread_id)
    try:
        return await supervisor_graph.ainvoke({
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
            "errors": None
        }, config={
            "configurable": {"thread_id": thread_id}
        })
    except RETRYABLE_ERRORS as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Design run failed after retries: {exc}"
        ) from exc


@app.post("/design/resume")
async def resume_design(req: ResumeDesignRequest):
    config = {"configurable": {"thread_id": req.thread_id}}
    print('thread_id in resume', req.thread_id)
    try:
        result = await supervisor_graph.ainvoke(Command(resume=req.answers), config=config)
    except RETRYABLE_ERRORS as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Design run failed after retries: {exc}"
        ) from exc
    return format_response(req.thread_id, result)
