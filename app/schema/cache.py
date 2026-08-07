from typing import Literal
from pydantic import BaseModel


class CachedItem(BaseModel):
    name: str  # e.g. "user session", "hot feed page", "product detail page"
    # e.g. "session:{user_id}", "feed:{user_id}:page:{n}"
    cache_key_pattern: str
    ttl_seconds: int
    eviction_policy: Literal["LRU", "LFU", "TTL-only", "FIFO"]
    # e.g. "invalidate on write", "write-through", "lazy expiry"
    invalidation_strategy: str
    reasoning: str  # why this specific item is worth caching


class CacheDesign(BaseModel):
    cache_type: Literal["in-memory single-node",
                        "distributed", "CDN-edge", "multi-tier"]
    cache_engine: str  # e.g. "Redis", "Memcached", "Redis Cluster"
    reasoning: str
    confidence: Literal["high", "low"]

    cached_items: list[CachedItem]

    consistency_model: str  # e.g. "eventual, invalidate on write with short TTL fallback"
    cache_hit_ratio_target: str  # e.g. "target >90% hit ratio for feed reads"

    hot_key_risk_notes: str  # addresses potential hot-key/thundering-herd problems
    cache_aside_vs_write_through: Literal["cache-aside",
                                          "write-through", "write-behind", "mixed"]

    estimated_memory_gb: float
    # short example: "GET feed:{user_id} -> miss -> query DB -> SET with TTL"
    sample_access_pattern: str
