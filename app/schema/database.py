from pydantic import BaseModel


class Column(BaseModel):
    name: str
    data_type: str
    constraints: list[str]  # e.g., ["NOT NULL", "DEFAULT NOW()"]
    description: str


class Index(BaseModel):
    name: str
    columns: list[str]
    index_type: str  # "btree", "hash", "gin", "gist"
    reasoning: str


class Table(BaseModel):
    name: str
    columns: list[Column]
    primary_key: list[str]
    # [{"column": "user_id", "references": "users.id"}]
    foreign_keys: list[dict]
    indexes: list[Index]
    description: str
    estimated_row_count: str  # e.g., "10M rows/year"


class Relationship(BaseModel):
    from_table: str
    to_table: str
    relationship_type: str  # "one-to-one", "one-to-many", "many-to-many"
    description: str


class DatabaseDesign(BaseModel):
    database_type: str  # "PostgreSQL", "MongoDB", "DynamoDB", etc.
    reasoning: str
    confidence: str
    tables: list[Table]
    relationships: list[Relationship]
    partitioning_strategy: str
    sample_queries: list[str]
