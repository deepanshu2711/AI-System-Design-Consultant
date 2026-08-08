from typing import Literal
from pydantic import BaseModel


class ApiParameter(BaseModel):
    name: str
    location: Literal["path", "query", "body", "header"]
    data_type: str
    required: bool
    description: str


class ApiResponse(BaseModel):
    status_code: int
    description: str
    example_body: str  # JSON string, formatted via the json_formatter tool


class ApiEndpoint(BaseModel):
    method: Literal["GET", "POST", "PUT", "PATCH", "DELETE"]
    path: str  # e.g. "/api/v1/users/{user_id}/posts"
    description: str
    parameters: list[ApiParameter]
    request_body_example: str | None  # JSON string, None for GET/DELETE typically
    responses: list[ApiResponse]
    requires_auth: bool
    rate_limit_notes: str
    source_table: str | None  # e.g. "posts" — links back to DatabaseDesign.tables[].name


class ApiDesign(BaseModel):
    api_style: Literal["REST", "GraphQL", "gRPC", "hybrid"]
    reasoning: str
    confidence: Literal["high", "low"]

    base_path: str  # e.g. "/api/v1"
    versioning_strategy: str

    endpoints: list[ApiEndpoint]

    auth_strategy: str  # e.g. "JWT bearer tokens, refresh token rotation"
    pagination_strategy: str  # e.g. "cursor-based for feeds, offset for admin lists"
    error_format: str  # e.g. "standard {error: {code, message}} envelope"
