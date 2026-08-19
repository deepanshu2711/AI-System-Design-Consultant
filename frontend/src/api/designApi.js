// Talks to the FastAPI backend in app/main.py — POST /design/start and
// POST /design/resume. Both return the shape produced by
// app/utils/helpers.py::format_response:
//   { status: "waiting_for_input", thread_id, message, questions } | { status: "complete", thread_id, state }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

async function postJson(path, body) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch (cause) {
    throw new Error(
      `Could not reach the backend at ${API_BASE_URL}. Is "uv run fastapi dev app/main.py" running? (${cause.message})`
    )
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const errorBody = await response.json()
      detail = errorBody.detail || detail
    } catch {
      // response body wasn't JSON — fall back to statusText
    }
    throw new Error(`Request to ${path} failed (${response.status}): ${detail}`)
  }

  return response.json()
}

export function startDesign(userQuery) {
  return postJson("/design/start", { user_query: userQuery })
}

export function resumeDesign(threadId, answers) {
  return postJson("/design/resume", { thread_id: threadId, answers })
}
