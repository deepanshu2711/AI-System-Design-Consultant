import asyncio
import uuid

from fastapi import FastAPI
from langgraph.types import Command

from app.grpahs.supervisor_graph import supervisor_graph
from app.schema.design import ResumeDesignRequest, StartDesignRequest
from app.utils.helpers import format_response

app = FastAPI()


@app.get("/")
def welcome():
    return {"message": "Welcome to AI System Design Condultant"}


@app.post('/design/start')
async def start_design(req: StartDesignRequest):
    thread_id = str(uuid.uuid4())
    print('start design thread id', thread_id)
    return await supervisor_graph.ainvoke({
        "user_query": req.user_query,
        "messages": None,
        "clarified_requirements": None,
        "user_clarifications": None,
        "clarification_rounds": 0,
        "traffic_estimates": None
    }, config={
        "configurable": {"thread_id": thread_id}
    })


@app.post("/design/resume")
async def resume_design(req: ResumeDesignRequest):
    config = {"configurable": {"thread_id": req.thread_id}}
    print('thread_id in resume', req.thread_id)
    result = await supervisor_graph.ainvoke(Command(resume=req.answers), config=config)
    return format_response(req.thread_id, result)
