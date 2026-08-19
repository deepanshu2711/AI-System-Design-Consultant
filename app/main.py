from app.utils.retry import RETRYABLE_ERRORS
from app.utils.helpers import format_response
from app.schema.design import ResumeDesignRequest, StartDesignRequest
from app.grpahs.supervisor_graph import supervisor_graph
from langgraph.types import Command
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
import uuid
import asyncio
from dotenv import load_dotenv

load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def welcome():
    return {"message": "Welcome to AI System Design Condultant"}


@app.post('/design/start')
async def start_design(req: StartDesignRequest):
    thread_id = str(uuid.uuid4())
    print('start design thread id', thread_id)
    try:
        result = await supervisor_graph.ainvoke({
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
            "errors": None
        }, config={
            "configurable": {"thread_id": thread_id}
        })
    except RETRYABLE_ERRORS as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Design run failed after retries: {exc}"
        ) from exc
    return format_response(thread_id, result)


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
