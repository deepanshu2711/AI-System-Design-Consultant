from pydantic import BaseModel


class CapacityPlan(BaseModel):
    storage_per_day_gb: float
    storage_per_year_tb: float
    replication_factor: float
    bandwidth_peak_mbps: float
    bandwidth_avg_mbps: float
    estimated_compute_nodes: int
    reasoning: str
    confidence: str
