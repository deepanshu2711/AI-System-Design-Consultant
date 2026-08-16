from typing import Annotated, TypedDict
from operator import add
from langchain_core.messages import BaseMessage

from app.schema.api import ApiDesign
from app.schema.cache import CacheDesign
from app.schema.capacity import CapacityPlan
from app.schema.cdn import CdnDesign
from app.schema.database import DatabaseDesign
from app.schema.error import AgentError
from app.schema.queue import QueueDesign
from app.schema.requirements import RequirementSpec
from app.schema.storage import StorageDesign
from app.schema.traffic import TrafficEstimate


class DesignState(TypedDict):
    messages: Annotated[list[BaseMessage], add] | None
    user_query: str
    clarified_requirements: RequirementSpec | None
    user_clarifications: dict | None
    clarification_rounds: int

    traffic_estimates: TrafficEstimate | None
    capacity_plan: CapacityPlan | None
    database_design: DatabaseDesign | None
    cache_design: CacheDesign | None
    queue_expert: QueueDesign | None
    api_design: ApiDesign | None

    cdn_design:  CdnDesign | None
    storage_design:  StorageDesign | None

    errors: Annotated[list[AgentError], add] | None
