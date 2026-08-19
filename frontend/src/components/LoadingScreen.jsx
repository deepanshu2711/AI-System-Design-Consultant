import { useEffect, useState } from "react"
import AgentGraph from "./AgentGraph.jsx"
import { AGENT_NODES } from "../data/agentGraph.js"

const STEP_MS = 320
const HOLD_MS = 550

export default function LoadingScreen({ onComplete }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (activeIndex >= AGENT_NODES.length) {
      const t = setTimeout(onComplete, HOLD_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [activeIndex, onComplete])

  const current = AGENT_NODES[Math.min(activeIndex, AGENT_NODES.length - 1)]
  const isDone = activeIndex >= AGENT_NODES.length

  return (
    <div className="loading-screen">
      <div className="loading-screen__intro">
        <span className="step-badge">{isDone ? "All agents finished" : "Agent pipeline running"}</span>
        <h2>{isDone ? "Assembling your design" : `Running: ${current.label}`}</h2>
        <p className="loading-screen__subtitle">
          The supervisor hands off to one specialist agent at a time — this graph mirrors that route.
        </p>
      </div>
      <div className="loading-screen__graph">
        <AgentGraph activeIndex={activeIndex} />
      </div>
    </div>
  )
}
