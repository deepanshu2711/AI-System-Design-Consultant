from pydantic import BaseModel


class ClarifyingQuestions(BaseModel):
    questions: list[str]
    reasoning: str


class ClarificationAssessment(BaseModel):
    needs_followup: bool
    followup_questions: list[str]
    reasoning: str
