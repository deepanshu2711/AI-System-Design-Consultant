from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator

from app.schema._validators import _reject_blank_or_placeholder


class ApiParameter(BaseModel):
    name: str = Field(min_length=1)
    location: Literal["path", "query", "body", "header"]
    data_type: str = Field(min_length=1)
    required: bool
    description: str = Field(min_length=1)

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_data_type = field_validator(
        "data_type")(_reject_blank_or_placeholder)
    _check_description = field_validator(
        "description")(_reject_blank_or_placeholder)


class ApiResponse(BaseModel):
    status_code: int = Field(ge=100, le=599)
    description: str = Field(min_length=1)
    example_body: str = Field(
        description="JSON string, formatted via the json_formatter tool")

    _check_description = field_validator(
        "description")(_reject_blank_or_placeholder)

    @model_validator(mode="after")
    def _example_body_required_unless_no_content(self):
        if self.status_code != 204 and not self.example_body.strip():
            raise ValueError(
                "example_body must not be blank unless status_code is 204 "
                "(No Content)"
            )
        return self


class ApiEndpoint(BaseModel):
    method: Literal["GET", "POST", "PUT", "PATCH", "DELETE"]
    path: str = Field(
        min_length=1,
        description="e.g. \"/api/v1/users/{user_id}/posts\"")
    description: str = Field(min_length=1)
    parameters: list[ApiParameter] = Field(max_length=10)
    request_body_example: str | None = Field(
        default=None,
        description="JSON string, None for GET/DELETE typically")
    responses: list[ApiResponse] = Field(min_length=1, max_length=3)
    requires_auth: bool
    rate_limit_notes: str = Field(min_length=1)
    source_table: str | None = Field(
        default=None,
        description="e.g. \"posts\" — links back to DatabaseDesign.tables[].name")

    _check_path = field_validator("path")(_reject_blank_or_placeholder)
    _check_description = field_validator(
        "description")(_reject_blank_or_placeholder)
    _check_rate_limit_notes = field_validator(
        "rate_limit_notes")(_reject_blank_or_placeholder)

    @field_validator("source_table")
    @classmethod
    def _check_source_table(cls, value: str | None) -> str | None:
        if value is not None:
            _reject_blank_or_placeholder(value)
        return value


class ApiDesign(BaseModel):
    api_style: Literal["REST", "GraphQL", "gRPC", "hybrid"]
    reasoning: str = Field(min_length=1)
    confidence: Literal["high", "low"]

    base_path: str = Field(min_length=1, description="e.g. \"/api/v1\"")
    versioning_strategy: str = Field(
        min_length=1,
        description="e.g. \"URI versioning (/api/v1), breaking changes bump the major version\"")

    endpoints: list[ApiEndpoint] = Field(min_length=1, max_length=6)

    auth_strategy: str = Field(
        min_length=1,
        description="e.g. \"JWT bearer tokens, refresh token rotation\"")
    pagination_strategy: str = Field(
        min_length=1,
        description="e.g. \"cursor-based for feeds, offset for admin lists\"")
    error_format: str = Field(
        min_length=1,
        description="e.g. \"standard {error: {code, message}} envelope\"")

    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)
    _check_base_path = field_validator(
        "base_path")(_reject_blank_or_placeholder)
    _check_versioning_strategy = field_validator(
        "versioning_strategy")(_reject_blank_or_placeholder)
    _check_auth_strategy = field_validator(
        "auth_strategy")(_reject_blank_or_placeholder)
    _check_pagination_strategy = field_validator(
        "pagination_strategy")(_reject_blank_or_placeholder)
    _check_error_format = field_validator(
        "error_format")(_reject_blank_or_placeholder)
