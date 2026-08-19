import { useState } from "react"
import Icon from "./Icon.jsx"
import PipelineOverlay from "./PipelineOverlay.jsx"
import { DESIGN_SECTIONS } from "../data/designSections.js"
import {
  RequirementsSection,
  TrafficSection,
  CapacitySection,
  DatabaseSection,
  CacheSection,
  QueueSection,
  ApiSection,
  CdnSection,
  StorageSection,
  MicroserviceSection,
} from "./sections.jsx"

const SECTION_COMPONENTS = {
  requirements: RequirementsSection,
  traffic: TrafficSection,
  capacity: CapacitySection,
  database: DatabaseSection,
  cache: CacheSection,
  queue: QueueSection,
  api: ApiSection,
  cdn: CdnSection,
  storage: StorageSection,
  microservice: MicroserviceSection,
}

export default function ResultsScreen({ query, designState, onReset }) {
  const involvesMedia = Boolean(designState?.clarified_requirements?.involves_media_content)
  const visibleSections = DESIGN_SECTIONS.filter((s) => !s.optional || involvesMedia)

  const [active, setActive] = useState(visibleSections[0].id)
  const [showPipeline, setShowPipeline] = useState(false)
  const ActiveSection = SECTION_COMPONENTS[active]
  const activeMeta = visibleSections.find((s) => s.id === active) || visibleSections[0]
  const errors = designState?.errors || []

  return (
    <div className="results-screen">
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__header-row">
            <span className="sidebar__badge">
              <Icon name="sparkles" size={14} />
              Design complete
            </span>
            <button className="sidebar__pipeline-btn" onClick={() => setShowPipeline(true)} title="View agent pipeline">
              <Icon name="network" size={15} />
            </button>
          </div>
          <p className="sidebar__query" title={query}>
            &ldquo;{query}&rdquo;
          </p>
        </div>

        <nav className="sidebar__nav">
          {visibleSections.map((s) => (
            <button
              key={s.id}
              className={`sidebar__nav-item ${active === s.id ? "is-active" : ""}`}
              onClick={() => setActive(s.id)}
            >
              <Icon name={s.icon} size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        {errors.length > 0 && (
          <div className="sidebar__errors">
            <Icon name="gauge" size={13} />
            {errors.length} agent {errors.length === 1 ? "error" : "errors"} during this run
          </div>
        )}

        <button className="sidebar__reset" onClick={onReset}>
          <Icon name="arrow-right" size={14} className="sidebar__reset-icon" />
          Start a new design
        </button>
      </aside>

      <main className="results-content">
        <ActiveSection data={designState?.[activeMeta.stateKey]} />
      </main>

      {showPipeline && <PipelineOverlay designState={designState} onClose={() => setShowPipeline(false)} />}
    </div>
  )
}
