import { useState } from "react"
import Icon from "./Icon.jsx"
import { designSections } from "../data/dummyData.js"
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

export default function ResultsScreen({ query, onReset }) {
  const [active, setActive] = useState(designSections[0].id)
  const ActiveSection = SECTION_COMPONENTS[active]

  return (
    <div className="results-screen">
      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="sidebar__badge">
            <Icon name="sparkles" size={14} />
            Design complete
          </span>
          <p className="sidebar__query" title={query}>
            &ldquo;{query}&rdquo;
          </p>
        </div>

        <nav className="sidebar__nav">
          {designSections.map((s) => (
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

        <button className="sidebar__reset" onClick={onReset}>
          <Icon name="arrow-right" size={14} className="sidebar__reset-icon" />
          Start a new design
        </button>
      </aside>

      <main className="results-content">
        <ActiveSection />
      </main>
    </div>
  )
}
