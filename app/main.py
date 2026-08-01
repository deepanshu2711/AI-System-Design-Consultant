import asyncio

from fastapi import FastAPI

from app.grpahs.supervisor_graph import supervisor_graph

app = FastAPI()


@app.get("/")
def welcome():
    return {"message": "Welcome to AI System Design Condultant"}


@app.get('/build')
async def research():
    return await supervisor_graph.ainvoke({
        "user_query": "Design Signal",
        "messages": None,
        "clarified_requirements": None,
        "user_clarifications": None
    })
