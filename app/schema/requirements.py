from pydantic import BaseModel


class RequirementSpec(BaseModel):
    functional_requirements: list[str]
    non_functional_requirements: list[str]
    assumed_scale: str
    explicit_assumptions: list[str]
    involves_media_content: bool
