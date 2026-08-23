from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator

from app.schema._validators import (
    _reject_blank_or_placeholder,
    _reject_blank_or_placeholder_items,
)


class CdnDesign(BaseModel):
    needed: bool
    cdn_provider: str = Field(
        min_length=1,
        description="e.g. \"CloudFront\", \"Cloudflare\", \"Fastly\"")
    cached_content_types: list[str] = Field(
        max_length=10,
        description="e.g. [\"profile images\", \"video thumbnails\", \"static assets\"]")
    cache_invalidation_strategy: str = Field(min_length=1)
    edge_locations_strategy: str = Field(
        min_length=1,
        description="e.g. \"global, prioritize high-traffic regions\"")
    reasoning: str = Field(min_length=1)
    confidence: Literal["high", "low"]

    _check_cdn_provider = field_validator(
        "cdn_provider")(_reject_blank_or_placeholder)
    _check_cached_content_types = field_validator(
        "cached_content_types")(_reject_blank_or_placeholder_items)
    _check_cache_invalidation_strategy = field_validator(
        "cache_invalidation_strategy")(_reject_blank_or_placeholder)
    _check_edge_locations_strategy = field_validator(
        "edge_locations_strategy")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)

    @model_validator(mode="after")
    def _needed_implies_real_design(self):
        if self.needed and not self.cached_content_types:
            raise ValueError(
                "needed=true but cached_content_types is empty — list at "
                "least one content type, or set needed=false if no CDN is "
                "actually required"
            )
        return self
