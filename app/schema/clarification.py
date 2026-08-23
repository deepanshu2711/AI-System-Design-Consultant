from pydantic import BaseModel, Field


class ClarifyingQuestions(BaseModel):
    questions: list[str] = Field(min_length=3, max_length=5)
    reasoning: str


class ClarificationAssessment(BaseModel):
    needs_followup: bool
    followup_questions: list[str] = Field(default_factory=list, max_length=2)
    reasoning: str
