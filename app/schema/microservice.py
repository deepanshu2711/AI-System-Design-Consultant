from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Literal

from app.schema._validators import (
    _reject_blank_or_placeholder,
    _reject_blank_or_placeholder_items,
)


class ServiceDefinition(BaseModel):
    name: str = Field(
        min_length=1,
        description="Name of the microservice, e.g. 'UserService'")
    responsibility: str = Field(
        min_length=1,
        description="Single, clear responsibility this service owns")
    owns_data: list[str] = Field(
        default_factory=list,
        description="Data entities/tables this service is the source of truth for")

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_responsibility = field_validator(
        "responsibility")(_reject_blank_or_placeholder)
    _check_owns_data = field_validator(
        "owns_data")(_reject_blank_or_placeholder_items)


class ServiceCommunication(BaseModel):
    from_service: str = Field(
        min_length=1,
        description="Initiating service — must match a ServiceDefinition.name")
    to_service: str = Field(
        min_length=1,
        description="Receiving service — must match a ServiceDefinition.name")
    pattern: Literal["sync_rest", "sync_grpc", "async_queue", "async_event"]
    reason: str = Field(
        min_length=1,
        description="Why this pattern was chosen over the alternatives")

    _check_from_service = field_validator(
        "from_service")(_reject_blank_or_placeholder)
    _check_to_service = field_validator(
        "to_service")(_reject_blank_or_placeholder)
    _check_reason = field_validator("reason")(_reject_blank_or_placeholder)


class MicroserviceDesign(BaseModel):
    services: list[ServiceDefinition] = Field(min_length=1, max_length=10)
    communications: list[ServiceCommunication] = Field(
        default_factory=list, max_length=20)
    decomposition_rationale: str = Field(
        min_length=1,
        description="Why the system was split this way — what boundaries were used (business capability, data ownership, team ownership, etc.)"
    )
    shared_concerns: str = Field(
        min_length=1,
        description="How cross-cutting concerns (auth, logging, config) are handled without duplicating logic across services"
    )

    _check_decomposition_rationale = field_validator(
        "decomposition_rationale")(_reject_blank_or_placeholder)
    _check_shared_concerns = field_validator(
        "shared_concerns")(_reject_blank_or_placeholder)

    @model_validator(mode="after")
    def _communications_reference_known_services(self):
        service_names = {s.name.strip().lower() for s in self.services}
        for comm in self.communications:
            if comm.from_service.strip().lower() not in service_names:
                raise ValueError(
                    f"communication.from_service {comm.from_service!r} does not "
                    "match any service in `services` — fix the service name or "
                    "add the service"
                )
            if comm.to_service.strip().lower() not in service_names:
                raise ValueError(
                    f"communication.to_service {comm.to_service!r} does not "
                    "match any service in `services` — fix the service name or "
                    "add the service"
                )
        return self
