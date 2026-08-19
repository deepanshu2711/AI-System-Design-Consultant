import Icon from "./Icon.jsx"
import { Badge, Card, ConfidenceBadge, DataTable, PageHeader, Pill, ReasoningNote, StatGrid, BulletList, CodeBlock } from "./ui.jsx"
import {
  dummyRequirements,
  dummyTraffic,
  dummyCapacity,
  dummyDatabase,
  dummyCache,
  dummyQueue,
  dummyApi,
  dummyCdn,
  dummyStorage,
  dummyMicroservice,
} from "../data/dummyData.js"

const fmt = (n) => new Intl.NumberFormat("en-US").format(n)

export function RequirementsSection() {
  const d = dummyRequirements
  return (
    <div className="section">
      <PageHeader
        icon="clipboard"
        eyebrow="Stage 1"
        title="Requirement Analysis"
        description="Functional and non-functional requirements distilled from your request and clarifying answers."
        meta={d.involves_media_content && <Badge tone="accent">Involves media content</Badge>}
      />
      <div className="section-grid section-grid--2">
        <Card title="Functional requirements">
          <BulletList items={d.functional_requirements} />
        </Card>
        <Card title="Non-functional requirements">
          <BulletList items={d.non_functional_requirements} />
        </Card>
      </div>
      <div className="section-grid section-grid--2">
        <Card title="Assumed scale">
          <p className="prose">{d.assumed_scale}</p>
        </Card>
        <Card title="Explicit assumptions">
          <BulletList items={d.explicit_assumptions} />
        </Card>
      </div>
    </div>
  )
}

export function TrafficSection() {
  const d = dummyTraffic
  return (
    <div className="section">
      <PageHeader icon="activity" eyebrow="Stage 2" title="Traffic Estimate" description="Read/write load derived from DAU/MAU and usage assumptions." />
      <StatGrid
        stats={[
          { label: "Daily active users", value: fmt(d.dau) },
          { label: "Monthly active users", value: fmt(d.mau) },
          { label: "Peak RPS", value: fmt(d.peak_rps) },
          { label: "Average RPS", value: fmt(d.avg_rps) },
          { label: "Read : write ratio", value: d.read_write_ratio },
          { label: "Avg request size", value: `${d.avg_request_size_kb} KB` },
          { label: "Avg response size", value: `${d.avg_response_size_kb} KB` },
        ]}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>
    </div>
  )
}

export function CapacitySection() {
  const d = dummyCapacity
  return (
    <div className="section">
      <PageHeader
        icon="server"
        eyebrow="Stage 3"
        title="Capacity Plan"
        description="Storage, bandwidth, and compute sizing for the estimated traffic."
        meta={<ConfidenceBadge confidence={d.confidence} />}
      />
      <StatGrid
        stats={[
          { label: "Storage / day", value: `${d.storage_per_day_gb} GB` },
          { label: "Storage / year", value: `${d.storage_per_year_tb} TB` },
          { label: "Replication factor", value: `${d.replication_factor}x` },
          { label: "Peak bandwidth", value: `${fmt(d.bandwidth_peak_mbps)} Mbps` },
          { label: "Avg bandwidth", value: `${fmt(d.bandwidth_avg_mbps)} Mbps` },
          { label: "Compute nodes", value: fmt(d.estimated_compute_nodes) },
        ]}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>
    </div>
  )
}

export function DatabaseSection() {
  const d = dummyDatabase
  return (
    <div className="section">
      <PageHeader
        icon="database"
        eyebrow="Stage 4"
        title="Database Design"
        description={d.database_type}
        meta={<ConfidenceBadge confidence={d.confidence} />}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>

      {d.tables.map((table) => (
        <Card key={table.name} title={table.name} subtitle={`${table.description} · ${table.estimated_row_count}`}>
          <DataTable
            columns={["Column", "Type", "Constraints", "Description"]}
            rows={table.columns.map((c) => [
              c.name,
              <code className="inline-code">{c.data_type}</code>,
              c.constraints.map((con) => (
                <Pill tone="neutral" key={con}>
                  {con}
                </Pill>
              )),
              c.description,
            ])}
          />
          {table.indexes.length > 0 && (
            <div className="sub-block">
              <span className="sub-block__label">Indexes</span>
              <BulletList
                items={table.indexes.map((idx) => (
                  <>
                    <code className="inline-code">{idx.name}</code> on ({idx.columns.join(", ")}) &mdash; {idx.reasoning}
                  </>
                ))}
              />
            </div>
          )}
        </Card>
      ))}

      <Card title="Relationships">
        <DataTable
          columns={["From", "To", "Type", "Description"]}
          rows={d.relationships.map((r) => [r.from_table, r.to_table, <Pill tone="accent">{r.relationship_type}</Pill>, r.description])}
        />
      </Card>

      <div className="section-grid section-grid--2">
        <Card title="Partitioning strategy">
          <p className="prose">{d.partitioning_strategy}</p>
        </Card>
        <Card title="Sample queries">
          <CodeBlock>{d.sample_queries.join("\n\n")}</CodeBlock>
        </Card>
      </div>
    </div>
  )
}

export function CacheSection() {
  const d = dummyCache
  return (
    <div className="section">
      <PageHeader
        icon="zap"
        eyebrow="Stage 5"
        title="Cache Design"
        description={`${d.cache_type} · ${d.cache_engine}`}
        meta={<ConfidenceBadge confidence={d.confidence} />}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>

      <Card title="Cached items">
        <DataTable
          columns={["Item", "Key pattern", "TTL", "Eviction", "Strategy"]}
          rows={d.cached_items.map((c) => [
            c.name,
            <code className="inline-code">{c.cache_key_pattern}</code>,
            `${c.ttl_seconds}s`,
            <Pill tone="neutral">{c.eviction_policy}</Pill>,
            c.invalidation_strategy,
          ])}
        />
      </Card>

      <StatGrid
        stats={[
          { label: "Hit ratio target", value: d.cache_hit_ratio_target },
          { label: "Est. memory", value: `${d.estimated_memory_gb} GB` },
          { label: "Write pattern", value: d.cache_aside_vs_write_through },
        ]}
      />

      <div className="section-grid section-grid--2">
        <Card title="Consistency model">
          <p className="prose">{d.consistency_model}</p>
        </Card>
        <Card title="Hot-key risk notes">
          <p className="prose">{d.hot_key_risk_notes}</p>
        </Card>
      </div>

      <Card title="Sample access pattern">
        <CodeBlock>{d.sample_access_pattern}</CodeBlock>
      </Card>
    </div>
  )
}

export function QueueSection() {
  const d = dummyQueue
  return (
    <div className="section">
      <PageHeader
        icon="layers"
        eyebrow="Stage 6"
        title="Queue Design"
        description={`${d.broker_type} · ${d.broker_engine}`}
        meta={<ConfidenceBadge confidence={d.confidence} />}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>

      {d.topics.map((t) => (
        <Card key={t.name} title={t.name}>
          <div className="kv-grid">
            <div>
              <span className="kv-grid__label">Producer</span>
              <span>{t.producer}</span>
            </div>
            <div>
              <span className="kv-grid__label">Consumer</span>
              <span>{t.consumer}</span>
            </div>
            <div>
              <span className="kv-grid__label">Delivery</span>
              <Pill tone="accent">{t.delivery_guarantee}</Pill>
            </div>
            <div>
              <span className="kv-grid__label">Ordering</span>
              <Pill tone="neutral">{t.ordering_requirement}</Pill>
            </div>
          </div>
          <div className="sub-block">
            <span className="sub-block__label">Message schema</span>
            <CodeBlock>{t.message_schema}</CodeBlock>
          </div>
          <p className="prose prose--muted">{t.reasoning}</p>
        </Card>
      ))}

      <StatGrid
        stats={[
          { label: "Throughput", value: `${fmt(d.estimated_throughput_msgs_per_sec)} msg/s` },
          { label: "Backpressure strategy", value: d.backpressure_strategy },
          { label: "Scaling strategy", value: d.scaling_strategy },
        ]}
      />

      <Card title="Sample flow">
        <CodeBlock>{d.sample_flow}</CodeBlock>
      </Card>
    </div>
  )
}

export function ApiSection() {
  const d = dummyApi
  return (
    <div className="section">
      <PageHeader
        icon="code"
        eyebrow="Stage 7"
        title="API Design"
        description={`${d.api_style} · base path ${d.base_path}`}
        meta={<ConfidenceBadge confidence={d.confidence} />}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>

      {d.endpoints.map((ep) => (
        <Card key={ep.path + ep.method}>
          <div className="endpoint-head">
            <Pill tone={ep.method === "GET" ? "accent" : "primary"}>{ep.method}</Pill>
            <code className="inline-code inline-code--lg">{ep.path}</code>
            {ep.requires_auth && <Badge tone="neutral">Auth required</Badge>}
          </div>
          <p className="prose">{ep.description}</p>

          {ep.parameters.length > 0 && (
            <div className="sub-block">
              <span className="sub-block__label">Parameters</span>
              <DataTable
                columns={["Name", "In", "Type", "Required", "Description"]}
                rows={ep.parameters.map((p) => [
                  <code className="inline-code">{p.name}</code>,
                  p.location,
                  p.data_type,
                  p.required ? "Yes" : "No",
                  p.description,
                ])}
              />
            </div>
          )}

          {ep.request_body_example && (
            <div className="sub-block">
              <span className="sub-block__label">Request body</span>
              <CodeBlock>{ep.request_body_example}</CodeBlock>
            </div>
          )}

          <div className="sub-block">
            <span className="sub-block__label">Responses</span>
            <DataTable
              columns={["Status", "Description", "Example"]}
              rows={ep.responses.map((r) => [
                <Pill tone={r.status_code < 300 ? "success" : "danger"}>{r.status_code}</Pill>,
                r.description,
                <code className="inline-code">{r.example_body}</code>,
              ])}
            />
          </div>
          <span className="rate-limit-note">{ep.rate_limit_notes}</span>
        </Card>
      ))}

      <div className="section-grid section-grid--2">
        <Card title="Auth strategy">
          <p className="prose">{d.auth_strategy}</p>
        </Card>
        <Card title="Pagination strategy">
          <p className="prose">{d.pagination_strategy}</p>
        </Card>
      </div>
    </div>
  )
}

export function CdnSection() {
  const d = dummyCdn
  return (
    <div className="section">
      <PageHeader
        icon="globe"
        eyebrow="Stage 8"
        title="CDN Design"
        description={d.cdn_provider}
        meta={<ConfidenceBadge confidence={d.confidence} />}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>
      <div className="section-grid section-grid--2">
        <Card title="Cached content types">
          <div className="chip-row">
            {d.cached_content_types.map((c) => (
              <Pill tone="neutral" key={c}>
                {c}
              </Pill>
            ))}
          </div>
        </Card>
        <Card title="Edge locations strategy">
          <p className="prose">{d.edge_locations_strategy}</p>
        </Card>
      </div>
      <Card title="Cache invalidation strategy">
        <p className="prose">{d.cache_invalidation_strategy}</p>
      </Card>
    </div>
  )
}

export function StorageSection() {
  const d = dummyStorage
  return (
    <div className="section">
      <PageHeader
        icon="hard-drive"
        eyebrow="Stage 9"
        title="Storage Design"
        description={d.storage_provider}
        meta={<ConfidenceBadge confidence={d.confidence} />}
      />
      <ReasoningNote>{d.reasoning}</ReasoningNote>
      <Card title="Buckets">
        <DataTable
          columns={["Bucket", "Content type", "Storage class", "Access pattern", "Lifecycle"]}
          rows={d.buckets.map((b) => [b.name, b.content_type, b.storage_class, b.access_pattern, b.lifecycle_policy])}
        />
      </Card>
      <StatGrid stats={[{ label: "Estimated storage / year", value: `${d.total_estimated_storage_tb_year} TB` }]} />
    </div>
  )
}

export function MicroserviceSection() {
  const d = dummyMicroservice
  return (
    <div className="section">
      <PageHeader icon="boxes" eyebrow="Stage 10" title="Microservice Design" description="Service boundaries and communication patterns." />

      <Card title="Services">
        <DataTable
          columns={["Service", "Responsibility", "Owns data"]}
          rows={d.services.map((s) => [
            s.name,
            s.responsibility,
            <div className="chip-row">
              {s.owns_data.map((o) => (
                <Pill tone="neutral" key={o}>
                  {o}
                </Pill>
              ))}
            </div>,
          ])}
        />
      </Card>

      <Card title="Service communication">
        <DataTable
          columns={["From", "To", "Pattern", "Reason"]}
          rows={d.communications.map((c) => [
            c.from_service,
            c.to_service,
            <Pill tone="accent">{c.pattern.replace("_", " ")}</Pill>,
            c.reason,
          ])}
        />
      </Card>

      <div className="section-grid section-grid--2">
        <Card title="Decomposition rationale">
          <p className="prose">{d.decomposition_rationale}</p>
        </Card>
        <Card title="Shared concerns">
          <p className="prose">{d.shared_concerns}</p>
        </Card>
      </div>
    </div>
  )
}
