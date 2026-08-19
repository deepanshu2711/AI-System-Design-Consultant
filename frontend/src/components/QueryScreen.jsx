import { useState } from "react"
import Icon from "./Icon.jsx"

const EXAMPLES = [
  "Design a photo-sharing app like Instagram",
  "Design a URL shortener",
  "Design a ride-sharing dispatch system",
  "Design a real-time chat application",
]

export default function QueryScreen({ onSubmit }) {
  const [value, setValue] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
  }

  return (
    <div className="query-screen">
      <div className="query-screen__badge">
        <Icon name="sparkles" size={14} />
        AI System Design Consultant
      </div>
      <h1 className="query-screen__title">
        What are we designing<br />today?
      </h1>
      <p className="query-screen__subtitle">
        Describe a system in a sentence. The consultant will ask clarifying questions,
        then produce a full architecture — requirements, traffic, capacity, data, and API design.
      </p>

      <form className="query-form" onSubmit={handleSubmit}>
        <textarea
          className="query-form__input"
          placeholder="e.g. Design a photo-sharing app like Instagram"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
        <button className="btn btn--primary query-form__submit" type="submit" disabled={!value.trim()}>
          Start design
          <Icon name="arrow-right" size={16} />
        </button>
      </form>

      <div className="query-examples">
        <span className="query-examples__label">Try an example</span>
        <div className="query-examples__chips">
          {EXAMPLES.map((ex) => (
            <button type="button" className="chip" key={ex} onClick={() => setValue(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
