import { useState } from "react"
import Icon from "./Icon.jsx"

export default function ClarifyingScreen({ query, message, questions, onSubmit, error }) {
  const [answers, setAnswers] = useState({})

  function setAnswer(q, val) {
    setAnswers((prev) => ({ ...prev, [q]: val }))
  }

  return (
    <div className="clarify-screen">
      <div className="clarify-screen__query">
        <span className="clarify-screen__query-label">Your request</span>
        <p>&ldquo;{query}&rdquo;</p>
      </div>

      <div className="clarify-screen__intro">
        <span className="step-badge">
          <Icon name="message-circle" size={14} />
          Clarifying questions
        </span>
        <p>{message}</p>
      </div>

      {error && (
        <div className="error-banner">
          <Icon name="gauge" size={15} />
          {error}
        </div>
      )}

      <form
        className="clarify-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(answers)
        }}
      >
        {questions.map((q, i) => (
          <div className="clarify-form__item" key={q}>
            <label className="clarify-form__question">
              <span className="clarify-form__number">{i + 1}</span>
              {q}
            </label>
            <textarea
              className="clarify-form__answer"
              rows={2}
              placeholder="Your answer (optional — defaults will be assumed)"
              value={answers[q] || ""}
              onChange={(e) => setAnswer(q, e.target.value)}
            />
          </div>
        ))}

        <button className="btn btn--primary clarify-form__submit" type="submit">
          Continue
          <Icon name="arrow-right" size={16} />
        </button>
      </form>
    </div>
  )
}
