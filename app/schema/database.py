from pydantic import BaseModel, Field, field_validator, model_validator

from app.schema._validators import _reject_blank_or_placeholder


def _normalize_table_key(name: str) -> str:
    """Plural-tolerant lookup key, e.g. "User" and "Users" both -> "user"."""
    key = name.strip().lower()
    if key.endswith("es"):
        return key[:-2]
    if key.endswith("s"):
        return key[:-1]
    return key


class Column(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    data_type: str = Field(min_length=1, max_length=150)
    # e.g., ["NOT NULL", "DEFAULT NOW()"]
    constraints: list[str] = Field(default_factory=list)
    description: str = Field(min_length=1, max_length=400)

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_data_type = field_validator(
        "data_type")(_reject_blank_or_placeholder)
    _check_description = field_validator(
        "description")(_reject_blank_or_placeholder)


class Index(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    columns: list[str] = Field(min_length=1)
    # "btree", "hash", "gin", "gist"
    index_type: str = Field(min_length=1, max_length=150)
    reasoning: str = Field(min_length=1, max_length=400)

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_index_type = field_validator(
        "index_type")(_reject_blank_or_placeholder)
    _check_reasoning = field_validator(
        "reasoning")(_reject_blank_or_placeholder)


class Table(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    columns: list[Column] = Field(min_length=1)
    indexes: list[Index] = Field(default_factory=list, max_length=4)
    description: str = Field(min_length=1, max_length=400)
    # e.g., "10M rows/year"
    estimated_row_count: str = Field(min_length=1, max_length=150)

    _check_name = field_validator("name")(_reject_blank_or_placeholder)
    _check_description = field_validator(
        "description")(_reject_blank_or_placeholder)
    _check_row_count = field_validator(
        "estimated_row_count")(_reject_blank_or_placeholder)


class Relationship(BaseModel):
    from_table: str = Field(min_length=1, max_length=150)
    to_table: str = Field(min_length=1, max_length=150)
    # "one-to-one", "one-to-many", "many-to-many"
    relationship_type: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1, max_length=400)


class DatabaseDesign(BaseModel):
    # "PostgreSQL", "MongoDB", "DynamoDB", etc.
    database_type: str = Field(min_length=1, max_length=150)
    reasoning: str = Field(min_length=1, max_length=400)
    confidence: str
    partitioning_strategy: str = Field(min_length=1, max_length=400)
    sample_queries: list[str] = Field(min_length=1, max_length=6)

    # Declared last: see QueueDesign in app/schema/queue.py for why the
    # risky nested-list fields are placed after every scalar field.
    tables: list[Table] = Field(min_length=3, max_length=8)
    relationships: list[Relationship] = Field(default_factory=list)

    @model_validator(mode="after")
    def _relationships_reference_known_tables(self):
        by_exact = {t.name.strip().lower(): t.name for t in self.tables}
        by_normalized: dict[str, str] = {}
        for t in self.tables:
            by_normalized.setdefault(_normalize_table_key(t.name), t.name)

        def resolve(table_ref: str, field: str) -> str:
            canonical = by_exact.get(table_ref.strip().lower())
            if canonical is None:
                # Tolerate near-misses like "User" vs "Users" or casing
                # differences, and snap to the table's actual spelling so
                # anything rendering an ER diagram off this field doesn't
                # end up with a dangling reference.
                canonical = by_normalized.get(_normalize_table_key(table_ref))
            if canonical is None:
                raise ValueError(
                    f"relationship.{field} {table_ref!r} does not match any "
                    f"table in `tables` ({sorted(by_exact.values())!r}) — "
                    "fix the table name or add the table"
                )
            return canonical

        for rel in self.relationships:
            rel.from_table = resolve(rel.from_table, "from_table")
            rel.to_table = resolve(rel.to_table, "to_table")
        return self
