from pydantic import BaseModel, Field
from typing import Literal


class ServiceDefinition(BaseModel):
    name: str = Field(
        description="Name of the microservice, e.g. 'UserService'")
    responsibility: str = Field(
        description="Single, clear responsibility this service owns")
    owns_data: list[str] = Field(
        description="Data entities/tables this service is the source of truth for")


class ServiceCommunication(BaseModel):
    from_service: str
    to_service: str
    pattern: Literal["sync_rest", "sync_grpc", "async_queue", "async_event"]
    reason: str = Field(
        description="Why this pattern was chosen over the alternatives")


class MicroserviceDesign(BaseModel):
    services: list[ServiceDefinition]
    communications: list[ServiceCommunication]
    decomposition_rationale: str = Field(
        description="Why the system was split this way — what boundaries were used (business capability, data ownership, team ownership, etc.)"
    )
    shared_concerns: str = Field(
        description="How cross-cutting concerns (auth, logging, config) are handled without duplicating logic across services"
    )
