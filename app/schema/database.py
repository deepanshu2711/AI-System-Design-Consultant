from pydantic import BaseModel, Field, field_validator, model_validator

_BLANK_PLACEHOLDERS = {"", "na", "n/a", "tbd", "none", "unknown", "-", "null"}


def _reject_blank_or_placeholder(value: str) -> str:
    if value.strip().lower() in _BLANK_PLACEHOLDERS:
        raise ValueError(
            "must not be blank or a placeholder like 'NA'/'TBD' — "
            "state the actual value instead"
        )
    return value


class Column(BaseModel):
    name: str = Field(min_length=1)
    data_type: str = Field(min_length=1)
    constraints: list[str] = Field(default_factory=list)  # e.g., ["NOT NULL", "DEFAULT NOW()"]
    description: str = Field(min_length=1)

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_data_type = field_validator("data_type")(_reject_blank_or_placeholder)
    _check_description = field_validator("description")(_reject_blank_or_placeholder)


class Index(BaseModel):
    name: str = Field(min_length=1)
    columns: list[str] = Field(min_length=1)
    index_type: str = Field(min_length=1)  # "btree", "hash", "gin", "gist"
    reasoning: str = Field(min_length=1)

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_index_type = field_validator("index_type")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator("reasoning")(_reject_blank_or_placeholder)


class Table(BaseModel):
    name: str = Field(min_length=1)
    columns: list[Column] = Field(min_length=1)
    indexes: list[Index] = Field(default_factory=list)
    description: str = Field(min_length=1)
    estimated_row_count: str = Field(min_length=1)  # e.g., "10M rows/year"

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_description = field_validator("description")(_reject_blank_or_placeholder)
    _check_row_count = field_validator("estimated_row_count")(_reject_blank_or_placeholder)


class Relationship(BaseModel):
    from_table: str = Field(min_length=1)
    to_table: str = Field(min_length=1)
    relationship_type: str = Field(min_length=1)  # "one-to-one", "one-to-many", "many-to-many"
    description: str = Field(min_length=1)


class DatabaseDesign(BaseModel):
    database_type: str = Field(min_length=1)  # "PostgreSQL", "MongoDB", "DynamoDB", etc.
    reasoning: str = Field(min_length=1)
    confidence: str
    tables: list[Table] = Field(min_length=3, max_length=10)
    relationships: list[Relationship] = Field(default_factory=list)
    partitioning_strategy: str = Field(min_length=1)
    sample_queries: list[str] = Field(min_length=1, max_length=6)

    @model_validator(mode="after")
    def _relationships_reference_known_tables(self):
        table_names = {t.name.strip().lower() for t in self.tables}
        for rel in self.relationships:
            if rel.from_table.strip().lower() not in table_names:
                raise ValueError(
                    f"relationship.from_table {rel.from_table!r} does not match "
                    "any table in `tables` — fix the table name or add the table"
                )
            if rel.to_table.strip().lower() not in table_names:
                raise ValueError(
                    f"relationship.to_table {rel.to_table!r} does not match "
                    "any table in `tables` — fix the table name or add the table"
                )
        return self
