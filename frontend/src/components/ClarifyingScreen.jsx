import { useState } from "react"
import Icon from "./Icon.jsx"
import { dummyClarifyingQuestions } from "../data/dummyData.js"

export default function ClarifyingScreen({ query, onSubmit }) {
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
        <p>{dummyClarifyingQuestions.reasoning}</p>
      </div>

      <form
        className="clarify-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(answers)
        }}
      >
        {dummyClarifyingQuestions.questions.map((q, i) => (
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
          Generate design
          <Icon name="arrow-right" size={16} />
        </button>
      </form>
    </div>
  )
}
