from typing import Literal
from pydantic import BaseModel


class CdnDesign(BaseModel):
    needed: bool
    cdn_provider: str  # e.g. "CloudFront", "Cloudflare", "Fastly"
    # e.g. ["profile images", "video thumbnails", "static assets"]
    cached_content_types: list[str]
    cache_invalidation_strategy: str
    edge_locations_strategy: str  # e.g. "global, prioritize high-traffic regions"
    reasoning: str
    confidence: Literal["high", "low"]
