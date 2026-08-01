def format_response(thread_id: str, result: dict) -> dict:
    if "__interrupt__" in result:
        payload = result["__interrupt__"][0].value
        return {
            "status": "waiting_for_input",
            "thread_id": thread_id,
            "message": payload["message"],
            "questions": payload["questions"],
        }

    return {
        "status": "complete",
        "thread_id": thread_id,
        "state": result,
    }
