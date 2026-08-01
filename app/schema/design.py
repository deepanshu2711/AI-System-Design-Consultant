from pydantic import BaseModel


class StartDesignRequest(BaseModel):
    user_query: str


class ResumeDesignRequest(BaseModel):
    thread_id: str
    answers: dict[str, str]
