from typing import Literal
from pydantic import BaseModel


class StorageBucket(BaseModel):
    name: str  # e.g. "user-uploads", "video-originals"
    content_type: str  # e.g. "images", "video", "documents"
    storage_class: str  # e.g. "S3 Standard", "S3 Glacier for archival"
    access_pattern: str  # e.g. "write-once, read-many"
    lifecycle_policy: str  # e.g. "move to cold storage after 90 days"


class StorageDesign(BaseModel):
    needed: bool
    storage_provider: str  # e.g. "AWS S3", "Google Cloud Storage"
    buckets: list[StorageBucket]
    total_estimated_storage_tb_year: float
    reasoning: str
    confidence: Literal["high", "low"]
