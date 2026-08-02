from langchain_core.tools import tool


@tool
def calculator(expression: str) -> str:
    """Evaluate a basic arithmetic expression and return the result as a string.
    Use this for ANY multiplication, division, or unit conversion —
    never compute numbers mentally, always call this tool.
    Example: calculator("500000000 * 0.1 / 86400") -> peak requests per second
    """
    try:
        # NOTE: eval take a string and execute it as python expressions
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"Error evaluating '{expression}': {e}"
