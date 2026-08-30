from pydantic import BaseModel, Field, model_validator


class TrafficEstimate(BaseModel):
    dau: int = Field(gt=0)
    mau: int = Field(gt=0)
    peak_rps: float = Field(gt=0)
    avg_rps: float = Field(gt=0)
    read_write_ratio: str = Field(min_length=1)
    avg_request_size_kb: float = Field(gt=0)
    avg_response_size_kb: float = Field(gt=0)
    reasoning: str = Field(min_length=1, max_length=400)

    @model_validator(mode="after")
    def validate_consistency(self):
        if self.dau > self.mau:
            raise ValueError("DAU cannot exceed MAU — check your numbers")
        if self.peak_rps < self.avg_rps:
            raise ValueError("Peak RPS cannot be lower than average RPS")
        return self
