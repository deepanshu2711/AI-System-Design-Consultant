import json
from langchain_core.tools import tool


@tool
def json_formatter(raw_json: str) -> str:
    """Validate and pretty-print a JSON string. Use this any time you produce an 
    example request or response body — never hand-format JSON yourself, always pass 
    your draft through this tool to guarantee it's syntactically valid.
    Input must be a valid JSON string (object or array). Returns the pretty-printed 
    version, or an error message if the JSON is invalid so you can fix it."""
    try:
        parsed = json.loads(raw_json)
        return json.dumps(parsed, indent=2)
    except json.JSONDecodeError as e:
        return f"Invalid JSON: {e}. Please fix the syntax and try again."
