import os

from langchain_ollama import ChatOllama

_DEFAULTS = dict(
    model=os.environ.get("OLLAMA_MODEL", "qwen2.5:3b"),
    temperature=0,
    repeat_last_n=256,
)


def build_llm(
    *,
    num_ctx: int = 8192,
    num_predict: int = 3072,
    timeout: int = 180,
    repeat_penalty: float = 1.3,
) -> ChatOllama:
    return ChatOllama(
        **_DEFAULTS,
        repeat_penalty=repeat_penalty,
        num_ctx=num_ctx,
        num_predict=num_predict,
        client_kwargs={"timeout": timeout},
    )


llm = build_llm()
