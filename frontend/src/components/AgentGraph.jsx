import Icon from "./Icon.jsx"
import { AGENT_NODES } from "../data/agentGraph.js"

const VIEW_W = 340
const MAIN_X = 60
const MAIN_W = 220
const BRANCH_W = 150
const BRANCH_LEFT_X = 15
const BRANCH_RIGHT_X = 175
const NODE_H = 48
const STEP_Y = 78
const CENTER_X = MAIN_X + MAIN_W / 2

function layout() {
  const positions = []
  let y = 8
  for (let i = 0; i < 8; i++) {
    positions.push({ x: MAIN_X, width: MAIN_W, y })
    y += STEP_Y
  }
  const branchY = y - STEP_Y + NODE_H + 42
  positions.push({ x: BRANCH_LEFT_X, width: BRANCH_W, y: branchY })
  positions.push({ x: BRANCH_RIGHT_X, width: BRANCH_W, y: branchY })
  const mergeY = branchY + NODE_H + 42
  positions.push({ x: MAIN_X, width: MAIN_W, y: mergeY })
  return { positions, doneY: mergeY + NODE_H + 40 }
}

const { positions: POS, doneY: DONE_Y } = layout()
const VIEW_H = DONE_Y + 40

function status(index, activeIndex) {
  if (index < activeIndex) return "done"
  if (index === activeIndex) return "active"
  return "pending"
}

function connectorColor(targetStatus) {
  if (targetStatus === "done") return "var(--success)"
  if (targetStatus === "active") return "var(--primary)"
  return "var(--border-strong)"
}

function Connector({ d, color, animated, dashed }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dashed ? "4 4" : undefined} />
      {animated && (
        <circle r={3.2} fill="var(--primary)" className="agent-graph__flow-dot">
          <animateMotion dur="0.9s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </g>
  )
}

function Node({ pos, node, state }) {
  const cx = pos.x + pos.width / 2
  const cy = pos.y + NODE_H / 2
  const tone =
    state === "done"
      ? { stroke: "var(--success)", fill: "var(--success-soft)", text: "var(--success)" }
      : state === "active"
      ? { stroke: "var(--primary)", fill: "var(--primary-soft)", text: "var(--primary)" }
      : { stroke: "var(--border-strong)", fill: "var(--surface)", text: "var(--text-faint)" }

  return (
    <g className={state === "done" || state === "skipped" ? "agent-graph__node-enter" : ""}>
      {state === "active" && (
        <rect
          x={pos.x - 4}
          y={pos.y - 4}
          width={pos.width + 8}
          height={NODE_H + 8}
          rx={14}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.5}
          className="agent-graph__pulse-ring"
        />
      )}
      <rect
        x={pos.x}
        y={pos.y}
        width={pos.width}
        height={NODE_H}
        rx={11}
        fill={tone.fill}
        stroke={tone.stroke}
        strokeWidth={1.5}
        strokeDasharray={state === "skipped" ? "5 4" : undefined}
        opacity={state === "skipped" ? 0.6 : 1}
        className={state === "active" ? "agent-graph__node-active" : ""}
      />
      <g transform={`translate(${pos.x + 14}, ${cy - 9})`} style={{ color: tone.text }}>
        {state === "done" ? <Icon name="check" size={18} /> : state === "skipped" ? <Icon name="x" size={16} /> : <Icon name={node.icon} size={18} />}
      </g>
      <text
        x={pos.x + 40}
        y={cy}
        dominantBaseline="middle"
        fontSize={state === "active" ? 12.5 : 12}
        fontWeight={state === "active" ? 700 : 500}
        fill={state === "pending" ? "var(--text-faint)" : state === "skipped" ? "var(--text-faint)" : "var(--text)"}
      >
        {node.label}
      </text>
      {state === "active" && (
        <circle cx={pos.x + pos.width - 14} cy={cy} r={4} fill="var(--primary)" className="agent-graph__dot" />
      )}
    </g>
  )
}

// activeIndex drives the loading-screen "one node running at a time" mode.
// Pass nodeStates ({ [nodeId]: "done" | "skipped" | "pending" }) instead for
// a results-screen summary of what actually ran on this design.
export default function AgentGraph({ activeIndex, nodeStates }) {
  const states = AGENT_NODES.map((node, i) => (nodeStates ? nodeStates[node.id] || "pending" : status(i, activeIndex)))
  const doneState = nodeStates
    ? states.every((s) => s === "done" || s === "skipped")
      ? "done"
      : "pending"
    : activeIndex >= AGENT_NODES.length
    ? "done"
    : "pending"

  const elbow = (x1, y1, x2, y2) => {
    const midY = y1 + (y2 - y1) / 2
    return `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`
  }

  return (
    <svg
      className="agent-graph"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      role="img"
      aria-label="Agent pipeline progress"
    >
      {/* chain 0..6 -> 1..7 */}
      {POS.slice(0, 7).map((p, i) => {
        const next = POS[i + 1]
        const targetState = states[i + 1]
        return (
          <Connector
            key={`c-${i}`}
            d={`M${CENTER_X},${p.y + NODE_H} L${CENTER_X},${next.y}`}
            color={connectorColor(targetState)}
            animated={targetState === "active"}
          />
        )
      })}

      {/* node 7 (api) -> branch left/right */}
      <Connector
        d={elbow(CENTER_X, POS[7].y + NODE_H, POS[8].x + POS[8].width / 2, POS[8].y)}
        color={connectorColor(states[8])}
        animated={states[8] === "active"}
        dashed={states[8] === "skipped"}
      />
      <Connector
        d={elbow(CENTER_X, POS[7].y + NODE_H, POS[9].x + POS[9].width / 2, POS[9].y)}
        color={connectorColor(states[9])}
        animated={states[9] === "active"}
        dashed={states[9] === "skipped"}
      />

      {/* branch left/right -> microservice */}
      <Connector
        d={elbow(POS[8].x + POS[8].width / 2, POS[8].y + NODE_H, CENTER_X, POS[10].y)}
        color={connectorColor(states[10])}
        animated={states[10] === "active"}
        dashed={states[8] === "skipped"}
      />
      <Connector
        d={elbow(POS[9].x + POS[9].width / 2, POS[9].y + NODE_H, CENTER_X, POS[10].y)}
        color={connectorColor(states[10])}
        dashed={states[9] === "skipped"}
      />

      {/* microservice -> done */}
      <Connector d={`M${CENTER_X},${POS[10].y + NODE_H} L${CENTER_X},${DONE_Y}`} color={connectorColor(doneState)} />

      {AGENT_NODES.map((node, i) => (
        <Node key={node.id} pos={POS[i]} node={node} state={states[i]} />
      ))}

      <g>
        <rect
          x={CENTER_X - 60}
          y={DONE_Y}
          width={120}
          height={32}
          rx={16}
          fill={doneState === "done" ? "var(--success-soft)" : "var(--surface)"}
          stroke={doneState === "done" ? "var(--success)" : "var(--border-strong)"}
          strokeWidth={1.5}
        />
        <text
          x={CENTER_X}
          y={DONE_Y + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11.5}
          fontWeight={700}
          fill={doneState === "done" ? "var(--success)" : "var(--text-faint)"}
        >
          Design complete
        </text>
      </g>
    </svg>
  )
}
