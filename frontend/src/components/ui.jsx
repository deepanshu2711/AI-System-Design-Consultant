import Icon from "./Icon.jsx"

export function Badge({ tone = "neutral", children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function ConfidenceBadge({ confidence }) {
  const tone = confidence === "high" ? "success" : "warning"
  return (
    <Badge tone={tone}>
      <Icon name={confidence === "high" ? "check" : "gauge"} size={12} />
      {confidence === "high" ? "High confidence" : "Low confidence"}
    </Badge>
  )
}

export function PageHeader({ eyebrow, title, description, icon, meta }) {
  return (
    <div className="page-header">
      <div className="page-header__top">
        <div className="page-header__title-row">
          {icon && (
            <span className="page-header__icon">
              <Icon name={icon} size={20} />
            </span>
          )}
          <div>
            {eyebrow && <div className="page-header__eyebrow">{eyebrow}</div>}
            <h2 className="page-header__title">{title}</h2>
          </div>
        </div>
        {meta}
      </div>
      {description && <p className="page-header__description">{description}</p>}
    </div>
  )
}

export function Card({ title, subtitle, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle) && (
        <div className="card__head">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  )
}

export function ReasoningNote({ children, label = "Reasoning" }) {
  if (!children) return null
  return (
    <div className="reasoning-note">
      <span className="reasoning-note__label">{label}</span>
      <p>{children}</p>
    </div>
  )
}

export function StatGrid({ stats }) {
  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <div className="stat-tile" key={s.label}>
          <span className="stat-tile__label">{s.label}</span>
          <span className="stat-tile__value">{s.value}</span>
          {s.hint && <span className="stat-tile__hint">{s.hint}</span>}
        </div>
      ))}
    </div>
  )
}

export function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pill({ children, tone = "neutral" }) {
  return <span className={`pill pill--${tone}`}>{children}</span>
}

export function CodeBlock({ children }) {
  return (
    <pre className="code-block">
      <code>{children}</code>
    </pre>
  )
}

export function EmptyList({ label }) {
  return <p className="empty-hint">{label}</p>
}

export function BulletList({ items }) {
  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
