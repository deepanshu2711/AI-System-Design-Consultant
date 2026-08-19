import { useEffect } from "react"
import Icon from "./Icon.jsx"
import AgentGraph from "./AgentGraph.jsx"
import { AGENT_NODES } from "../data/agentGraph.js"

export default function PipelineOverlay({ designState, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const involvesMedia = Boolean(designState?.clarified_requirements?.involves_media_content)

  const nodeStates = Object.fromEntries(
    AGENT_NODES.map((node) => {
      if (node.branch && !involvesMedia) return [node.id, "skipped"]
      return [node.id, designState?.[node.stateKey] ? "done" : "pending"]
    })
  )

  return (
    <div className="pipeline-overlay" onClick={onClose}>
      <div className="pipeline-overlay__panel" onClick={(e) => e.stopPropagation()}>
        <div className="pipeline-overlay__head">
          <div>
            <span className="step-badge">
              <Icon name="network" size={14} />
              Supervisor route
            </span>
            <h3>How this design was built</h3>
          </div>
          <button className="pipeline-overlay__close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        <p className="pipeline-overlay__subtitle">
          The actual path app.agents.supervisor took for this run.
          {!involvesMedia && " CDN/Storage were skipped since the request didn't involve media content."}
        </p>
        <div className="pipeline-overlay__graph">
          <AgentGraph nodeStates={nodeStates} />
        </div>
      </div>
    </div>
  )
}
