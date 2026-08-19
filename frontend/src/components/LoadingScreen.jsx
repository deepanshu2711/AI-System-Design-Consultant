import { useEffect, useRef, useState } from "react"
import AgentGraph from "./AgentGraph.jsx"
import { AGENT_NODES } from "../data/agentGraph.js"

const STEP_MS = 420
const HOLD_MS = 450

// variant "clarify": only the clarifying-questions agent is actually running
// server-side, so the graph stays pinned on that node instead of implying
// progress it hasn't made. variant "pipeline": the full chain may be running
// (we can't observe it mid-flight — the backend is a single blocking call —
// so this is a cosmetic loop that keeps cycling until `settle` flips true).
export default function LoadingScreen({ variant = "pipeline", settle, onComplete }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const settleHandled = useRef(false)

  useEffect(() => {
    if (variant === "clarify" || settle) return
    const t = setTimeout(() => setActiveIndex((i) => (i + 1) % AGENT_NODES.length), STEP_MS)
    return () => clearTimeout(t)
  }, [activeIndex, settle, variant])

  useEffect(() => {
    if (!settle || settleHandled.current) return
    settleHandled.current = true
    if (variant === "pipeline") setActiveIndex(AGENT_NODES.length)
    const t = setTimeout(onComplete, HOLD_MS)
    return () => clearTimeout(t)
  }, [settle, variant, onComplete])

  const displayIndex = variant === "clarify" ? 0 : activeIndex
  const current = AGENT_NODES[Math.min(displayIndex, AGENT_NODES.length - 1)]
  const isDone = variant === "pipeline" && displayIndex >= AGENT_NODES.length

  const heading =
    variant === "clarify" ? "Thinking of clarifying questions…" : isDone ? "Assembling your design" : `Running: ${current.label}`

  const subtitle =
    variant === "clarify"
      ? "The clarifying-questions agent is reading your request."
      : "The supervisor hands off to one specialist agent at a time — this graph mirrors that route."

  return (
    <div className="loading-screen">
      <div className="loading-screen__intro">
        <span className="step-badge">
          {variant === "clarify" ? "Clarifying" : isDone ? "All agents finished" : "Agent pipeline running"}
        </span>
        <h2>{heading}</h2>
        <p className="loading-screen__subtitle">{subtitle}</p>
      </div>
      <div className="loading-screen__graph">
        <AgentGraph activeIndex={displayIndex} />
      </div>
    </div>
  )
}
