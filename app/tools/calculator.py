import ast
import operator

from langchain_core.tools import tool

_ALLOWED_BINOPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

_ALLOWED_UNARYOPS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


def _eval_node(node):
    if isinstance(node, ast.Expression):
        return _eval_node(node.body)
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError(f"Unsupported constant: {node.value!r}")
    if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BINOPS:
        return _ALLOWED_BINOPS[type(node.op)](
            _eval_node(node.left), _eval_node(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARYOPS:
        return _ALLOWED_UNARYOPS[type(node.op)](_eval_node(node.operand))
    raise ValueError(f"Unsupported expression: {ast.dump(node)}")


def safe_eval(expression: str):
    """Evaluate a numeric expression using only literals, +, -, *, /, //, %, **.
    Rejects names, attribute access, calls, subscripts, and anything else that
    isn't plain arithmetic — unlike eval(), this can't be escaped into arbitrary
    code execution via object introspection (e.g. `().__class__.__bases__`).
    """
    tree = ast.parse(expression, mode="eval")
    return _eval_node(tree)


@tool
def calculator(expression: str) -> str:
    """Evaluate a basic arithmetic expression and return the result as a string.
    Use this for ANY multiplication, division, or unit conversion —
    never compute numbers mentally, always call this tool.
    Example: calculator("500000000 * 0.1 / 86400") -> peak requests per second
    """
    try:
        result = safe_eval(expression)
        return str(result)
    except Exception as e:
        return f"Error evaluating '{expression}': {e}"
