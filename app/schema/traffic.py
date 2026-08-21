from pydantic import BaseModel, model_validator


class TrafficEstimate(BaseModel):
    dau: int
    mau: int
    peak_rps: float
    avg_rps: float
    read_write_ratio: str
    avg_request_size_kb: float
    avg_response_size_kb: float
    reasoning: str

    @model_validator(mode="after")
    def validate_consistency(self):
        if self.dau > self.mau:
            raise ValueError("DAU cannot exceed MAU — check your numbers")
        if self.peak_rps < self.avg_rps:
            raise ValueError("Peak RPS cannot be lower than average RPS")
        return self
