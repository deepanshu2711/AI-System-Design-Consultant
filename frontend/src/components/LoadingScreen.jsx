import { useEffect, useState } from "react"
import Icon from "./Icon.jsx"

const STEPS = [
  "Analyzing requirements",
  "Estimating traffic",
  "Planning capacity",
  "Designing database schema",
  "Designing cache layer",
  "Designing message queues",
  "Designing API surface",
]

export default function LoadingScreen() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, STEPS.length - 1))
    }, 450)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="loading-screen">
      <div className="loading-screen__spinner">
        <Icon name="loader" size={28} />
      </div>
      <h2>Running the agent chain&hellip;</h2>
      <p className="loading-screen__subtitle">Each specialist agent hands its output to the next.</p>
      <ul className="loading-steps">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={
              i < activeIndex ? "is-done" : i === activeIndex ? "is-active" : "is-pending"
            }
          >
            <span className="loading-steps__marker">
              {i < activeIndex ? <Icon name="check" size={12} /> : null}
            </span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}
