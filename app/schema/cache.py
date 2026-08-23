from typing import Literal
from pydantic import BaseModel, Field, field_validator

from app.schema._validators import _reject_blank_or_placeholder


class CachedItem(BaseModel):
    name: str = Field(
        min_length=1,
        description="e.g. \"user session\", \"hot feed page\", \"product detail page\"")
    cache_key_pattern: str = Field(
        min_length=1,
        description="e.g. \"session:{user_id}\", \"feed:{user_id}:page:{n}\"")
    ttl_seconds: int = Field(gt=0)
    eviction_policy: Literal["LRU", "LFU", "TTL-only", "FIFO"]
    invalidation_strategy: str = Field(
        min_length=1,
        description="e.g. \"invalidate on write\", \"write-through\", \"lazy expiry\"")
    reasoning: str = Field(
        min_length=1,
        description="why this specific item is worth caching")

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_cache_key_pattern = field_validator(
        "cache_key_pattern")(_reject_blank_or_placeholder)
    _check_invalidation_strategy = field_validator(
        "invalidation_strategy")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)


class CacheDesign(BaseModel):
    cache_type: Literal["in-memory single-node",
                        "distributed", "CDN-edge", "multi-tier"]
    cache_engine: str = Field(
        min_length=1,
        description="e.g. \"Redis\", \"Memcached\", \"Redis Cluster\"")
    reasoning: str = Field(min_length=1)
    confidence: Literal["high", "low"]

    cached_items: list[CachedItem] = Field(min_length=1, max_length=8)

    consistency_model: str = Field(
        min_length=1,
        description="e.g. \"eventual, invalidate on write with short TTL fallback\"")
    cache_hit_ratio_target: str = Field(
        min_length=1,
        description="e.g. \"target >90% hit ratio for feed reads\"")

    hot_key_risk_notes: str = Field(
        min_length=1,
        description="addresses potential hot-key/thundering-herd problems")
    cache_aside_vs_write_through: Literal["cache-aside",
                                          "write-through", "write-behind", "mixed"]

    estimated_memory_gb: float = Field(gt=0)
    sample_access_pattern: str = Field(
        min_length=1,
        description="short example: \"GET feed:{user_id} -> miss -> query DB -> SET with TTL\"")

    _check_cache_engine = field_validator(
        "cache_engine")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)
    _check_consistency_model = field_validator(
        "consistency_model")(_reject_blank_or_placeholder)
    _check_cache_hit_ratio_target = field_validator(
        "cache_hit_ratio_target")(_reject_blank_or_placeholder)
    _check_hot_key_risk_notes = field_validator(
        "hot_key_risk_notes")(_reject_blank_or_placeholder)
    _check_sample_access_pattern = field_validator(
        "sample_access_pattern")(_reject_blank_or_placeholder)
