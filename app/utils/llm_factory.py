from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="qwen2.5:3b",
    temperature=0,
    num_ctx=8192,
    num_predict=3072,
    repeat_penalty=1.3,
    repeat_last_n=256,
    client_kwargs={"timeout": 120},
)
