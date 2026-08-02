from typing import Annotated, TypedDict
from operator import add
from langchain_core.messages import BaseMessage

from app.schema.capacity import CapacityPlan
from app.schema.requirements import RequirementSpec
from app.schema.traffic import TrafficEstimate


class DesignState(TypedDict):
    messages: Annotated[list[BaseMessage], add] | None
    user_query: str
    clarified_requirements: RequirementSpec | None
    user_clarifications: dict | None
    clarification_rounds: int

    traffic_estimates: TrafficEstimate | None
    capacity_plan: CapacityPlan | None
