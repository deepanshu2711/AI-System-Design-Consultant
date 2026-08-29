from typing import Literal
from pydantic import BaseModel, Field, field_validator

from app.schema._validators import _reject_blank_or_placeholder


class QueueTopic(BaseModel):
    name: str = Field(
        min_length=1, max_length=150,
        description="e.g. \"video-transcoding-jobs\", \"notification-fanout\"")
    producer: str = Field(
        min_length=1, max_length=150,
        description="what triggers a message onto this queue, e.g. \"video upload service\"")
    consumer: str = Field(
        min_length=1, max_length=150,
        description="what processes messages off this queue, e.g. \"transcoding workers\"")
    message_schema: str = Field(
        min_length=1, max_length=400,
        description="short description or example payload shape")
    delivery_guarantee: Literal["at-most-once",
                                "at-least-once", "exactly-once"]
    ordering_requirement: Literal["none", "per-key", "strict-global"]
    retry_policy: str = Field(
        min_length=1, max_length=400,
        description="e.g. \"3 retries, exponential backoff, then dead-letter\"")
    dead_letter_strategy: str = Field(
        min_length=1, max_length=400,
        description="where and how permanently-failed messages are captured for inspection")
    reasoning: str = Field(
        min_length=1, max_length=400,
        description="why this needs to be async / a queue at all")

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_producer = field_validator(
        "producer")(_reject_blank_or_placeholder)
    _check_consumer = field_validator(
        "consumer")(_reject_blank_or_placeholder)
    _check_message_schema = field_validator(
        "message_schema")(_reject_blank_or_placeholder)
    _check_retry_policy = field_validator(
        "retry_policy")(_reject_blank_or_placeholder)
    _check_dead_letter_strategy = field_validator(
        "dead_letter_strategy")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)


class QueueDesign(BaseModel):
    broker_type: Literal["message-queue",
                         "pub-sub", "log-based-streaming", "hybrid"]
    broker_engine: str = Field(
        min_length=1, max_length=150,
        description="e.g. RabbitMQ, Kafka, SQS, Redis Streams")
    reasoning: str = Field(min_length=1, max_length=400)
    confidence: Literal["high", "low"]

    backpressure_strategy: str = Field(
        min_length=1, max_length=400,
        description="what happens when consumers can't keep up")
    scaling_strategy: str = Field(
        min_length=1, max_length=400,
        description="how consumers scale — e.g. \"horizontal, partition-based\"")

    estimated_throughput_msgs_per_sec: float = Field(gt=0)
    estimated_queue_depth_notes: str = Field(
        min_length=1, max_length=400,
        description="expected backlog under normal vs peak load")

    sample_flow: str = Field(
        min_length=1, max_length=400,
        description="short example: \"upload -> queue: video-transcoding-jobs -> "
                    "worker picks up -> transcodes -> writes to storage -> notifies user\"")

    # Declared last: the nested list is the highest-risk/most token-heavy
    # field, so if a rambling generation truncates the JSON here, every
    # scalar field above has already been emitted successfully.
    topics: list[QueueTopic] = Field(min_length=1, max_length=6)

    _check_broker_engine = field_validator(
        "broker_engine")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)
    _check_backpressure_strategy = field_validator(
        "backpressure_strategy")(_reject_blank_or_placeholder)
    _check_scaling_strategy = field_validator(
        "scaling_strategy")(_reject_blank_or_placeholder)
    _check_estimated_queue_depth_notes = field_validator(
        "estimated_queue_depth_notes")(_reject_blank_or_placeholder)
    _check_sample_flow = field_validator(
        "sample_flow")(_reject_blank_or_placeholder)
