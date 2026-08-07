from typing import Literal
from pydantic import BaseModel


class QueueTopic(BaseModel):
    name: str  # e.g. "video-transcoding-jobs", "notification-fanout"
    producer: str  # what triggers a message onto this queue, e.g. "video upload service"
    consumer: str  # what processes messages off this queue, e.g. "transcoding workers"
    message_schema: str  # short description or example payload shape
    delivery_guarantee: Literal["at-most-once",
                                "at-least-once", "exactly-once"]
    ordering_requirement: Literal["none", "per-key", "strict-global"]
    retry_policy: str  # e.g. "3 retries, exponential backoff, then dead-letter"
    dead_letter_strategy: str
    reasoning: str  # why this needs to be async / a queue at all


class QueueDesign(BaseModel):
    broker_type: Literal["message-queue",
                         "pub-sub", "log-based-streaming", "hybrid"]
    broker_engine: str  # e.g. "RabbitMQ", "Kafka", "SQS", "Redis Streams"
    reasoning: str
    confidence: Literal["high", "low"]

    topics: list[QueueTopic]

    backpressure_strategy: str  # what happens when consumers can't keep up
    scaling_strategy: str  # how consumers scale — e.g. "horizontal, partition-based"

    estimated_throughput_msgs_per_sec: float
    estimated_queue_depth_notes: str  # expected backlog under normal vs peak load

    sample_flow: str  # short example: "upload -> queue: video-transcoding-jobs -> worker picks up -> transcodes -> writes to storage -> notifies user"
