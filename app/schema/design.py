from pydantic import BaseModel


class StartDesignRequest(BaseModel):
    user_query: str
    thread_id: str | None = None


class ResumeDesignRequest(BaseModel):
    thread_id: str
    answers: dict[str, str]
