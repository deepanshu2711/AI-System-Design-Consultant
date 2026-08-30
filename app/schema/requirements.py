from pydantic import BaseModel, Field


class RequirementSpec(BaseModel):
    functional_requirements: list[str] = Field(min_length=5, max_length=8)
    non_functional_requirements: list[str] = Field(min_length=4, max_length=6)
    assumed_scale: str = Field(min_length=1)
    explicit_assumptions: list[str] = Field(min_length=4, max_length=5)
    involves_media_content: bool
