from typing import Annotated, TypedDict
from operator import add
from langchain_core.messages import BaseMessage

from app.schema.requirements import RequirementSpec


class DesignState(TypedDict):
    messages: Annotated[list[BaseMessage], add]
    user_query: str
    clarified_requirements: RequirementSpec | None
    user_clarifications: dict | None
