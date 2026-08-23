_BLANK_PLACEHOLDERS = {"", "na", "n/a", "tbd", "none", "unknown", "-", "null"}


def _reject_blank_or_placeholder(value: str) -> str:
    if value.strip().lower() in _BLANK_PLACEHOLDERS:
        raise ValueError(
            "must not be blank or a placeholder like 'NA'/'TBD' — "
            "state the actual value instead"
        )
    return value
