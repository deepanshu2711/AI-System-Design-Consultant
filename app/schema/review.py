from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator
from app.schema._validators import _reject_blank_or_placeholder


REVISABLE_AGENT = Literal[
    "database_designer_agent", "cache_expert_agent",
    "queue_expert_agent", "api_designer_agent",
]


class ReviewIssues(BaseModel):
    target: REVISABLE_AGENT
    severity: Literal["blocker", "warning"]
    description: str = Field(min_length=1)
    suggested_fix: str = Field(min_length=1)

    _check_description = field_validator(
        "description")(_reject_blank_or_placeholder)
    _check_suggested_fix = field_validator(
        "suggested_fix")(_reject_blank_or_placeholder)


class ReviewFeedback(BaseModel):
    approved: bool
    summary: str = Field(min_length=1)
    issues: list[ReviewIssues] = Field(default_factory=list, max_length=6)

    _check_summary = field_validator("summary")(_reject_blank_or_placeholder)

    @model_validator(mode="after")
    def _consistent_with_issues(self):
        if not self.approved and not self.issues:
            raise ValueError("approved=False requires at least one issue")
        if self.approved and any(i.severity == "blocker" for i in self.issues):
            raise ValueError("cannot approve while a blocker issue remains")
        return self
