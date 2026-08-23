from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator

from app.schema._validators import _reject_blank_or_placeholder


class StorageBucket(BaseModel):
    name: str = Field(
        min_length=1,
        description="e.g. \"user-uploads\", \"video-originals\"")
    content_type: str = Field(
        min_length=1,
        description="e.g. \"images\", \"video\", \"documents\"")
    storage_class: str = Field(
        min_length=1,
        description="e.g. \"S3 Standard\", \"S3 Glacier for archival\"")
    access_pattern: str = Field(
        min_length=1,
        description="e.g. \"write-once, read-many\"")
    lifecycle_policy: str = Field(
        min_length=1,
        description="e.g. \"move to cold storage after 90 days\"")

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_content_type = field_validator(
        "content_type")(_reject_blank_or_placeholder)
    _check_storage_class = field_validator(
        "storage_class")(_reject_blank_or_placeholder)
    _check_access_pattern = field_validator(
        "access_pattern")(_reject_blank_or_placeholder)
    _check_lifecycle_policy = field_validator(
        "lifecycle_policy")(_reject_blank_or_placeholder)


class StorageDesign(BaseModel):
    needed: bool
    storage_provider: str = Field(
        min_length=1,
        description="e.g. \"AWS S3\", \"Google Cloud Storage\"")
    buckets: list[StorageBucket] = Field(max_length=8)
    total_estimated_storage_tb_year: float = Field(ge=0)
    reasoning: str = Field(min_length=1)
    confidence: Literal["high", "low"]

    _check_storage_provider = field_validator(
        "storage_provider")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)

    @model_validator(mode="after")
    def _needed_implies_real_design(self):
        if self.needed and not self.buckets:
            raise ValueError(
                "needed=true but buckets is empty — design at least one "
                "bucket, or set needed=false if no storage is actually required"
            )
        if self.needed and self.total_estimated_storage_tb_year <= 0:
            raise ValueError(
                "needed=true but total_estimated_storage_tb_year is 0 — "
                "compute a real estimate with the calculator tool"
            )
        return self
