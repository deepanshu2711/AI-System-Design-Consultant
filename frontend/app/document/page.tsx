"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CompassTool, FileMd, FilePdf, Info, WarningCircle, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import {
  getDesignState,
  isWaitingForInput,
  type ApiEndpoint,
  type CachedItem,
  type DesignState,
  type QueueTopic,
  type RunComplete,
  type Table as TableArtifact,
} from "@/lib/api";

type Section = { title: string; schema: string; node: React.ReactNode };

const MAX_SECTIONS = 10;

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function DocumentPage() {
  return (
    <Suspense fallback={<CenteredMessage text="Loading design document…" />}>
      <DocumentScreen />
    </Suspense>
  );
}

function DocumentScreen() {
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  const [phase, setPhase] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [res, setRes] = useState<RunComplete | null>(null);

  useEffect(() => {
    if (!threadId) {
      setPhase("error");
      setErrorMessage("No run selected — start a new design to generate a document.");
      return;
    }
    let cancelled = false;
    getDesignState(threadId)
      .then((data) => {
        if (cancelled) return;
        if (isWaitingForInput(data)) {
          setErrorMessage("This run is still waiting on clarifying answers — it hasn't finished yet.");
          setPhase("error");
          return;
        }
        setRes(data);
        setPhase("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setErrorMessage(err.message.startsWith("404") ? "No finished run found for this thread." : err.message);
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  if (phase === "loading") return <CenteredMessage text="Loading design document…" icon="spin" />;
  if (phase === "error" || !res) return <CenteredMessage text={errorMessage} icon="warn" />;

  return <Document res={res} />;
}

function CenteredMessage({ text, icon }: { text: string; icon?: "spin" | "warn" }) {
  return (
    <div className="grid h-screen place-items-center bg-bg px-6">
      <div className="flex max-w-[46ch] flex-col items-center gap-3 text-center">
        <span className="flex items-center gap-2 text-[14.5px] font-medium">
          <CompassTool weight="fill" size={17} className="text-accent" />
          Consultant
        </span>
        {icon === "spin" && <CircleNotch size={20} className="animate-spin text-accent" />}
        {icon === "warn" && <WarningCircle size={20} style={{ color: "#e08a83" }} />}
        <p className="m-0 text-[14px] leading-[23px] text-neutral-400">{text}</p>
        <Link href="/prompt" className="btn btn-secondary mt-2">
          Start a new design
        </Link>
      </div>
    </div>
  );
}

function Document({ res }: { res: RunComplete }) {
  const state = (res.state ?? {}) as DesignState;
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);

  const docRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const req = state.clarified_requirements;
  const assumptionCount = req?.explicit_assumptions.length ?? 0;

  const sections: Section[] = [];

  if (req) {
    sections.push({
      title: "Requirements",
      schema: "RequirementSpec",
      node: (
        <>
          <div className="grid grid-cols-1 gap-6.5 md:grid-cols-2">
            <div>
              <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Functional</p>
              <BulletList items={req.functional_requirements} />
            </div>
            <div>
              <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Non-functional</p>
              <BulletList items={req.non_functional_requirements} />
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-[22px] text-neutral-500">
            Assumed scale: <span className="text-neutral-300">{req.assumed_scale}</span>
            {req.involves_media_content && <span className="ml-2 tag tag-outline text-[10px]">involves media content</span>}
          </p>
          {req.explicit_assumptions.map((a, i) => (
            <Assumption key={i} n={i + 1} total={assumptionCount}>
              {a}
            </Assumption>
          ))}
        </>
      ),
    });
  }

  if (state.traffic_estimates) {
    const t = state.traffic_estimates;
    sections.push({
      title: "Traffic",
      schema: "TrafficEstimate",
      node: (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4.5 sm:grid-cols-5">
            <Stat label="DAU" value={t.dau.toLocaleString()} />
            <Stat label="MAU" value={t.mau.toLocaleString()} />
            <Stat label="Avg RPS" value={t.avg_rps.toLocaleString()} />
            <Stat label="Peak RPS" value={t.peak_rps.toLocaleString()} />
            <Stat label="Read : write" value={t.read_write_ratio} />
          </div>
          <p className="m-0 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
            Average request {t.avg_request_size_kb} KB, average response {t.avg_response_size_kb} KB. {t.reasoning}
          </p>
        </>
      ),
    });
  }

  if (state.capacity_plan) {
    const c = state.capacity_plan;
    sections.push({
      title: "Capacity",
      schema: "CapacityPlan",
      node: (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4.5 sm:grid-cols-4">
            <Stat label="Storage / day" value={`${c.storage_per_day_gb} GB`} />
            <Stat label="Storage / year" value={`${c.storage_per_year_tb} TB`} />
            <Stat label="Bandwidth peak" value={`${c.bandwidth_peak_mbps} Mb/s`} />
            <Stat label="Compute nodes" value={String(c.estimated_compute_nodes)} />
          </div>
          <p className="m-0 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
            Replication factor {c.replication_factor}, average bandwidth {c.bandwidth_avg_mbps} Mb/s. {c.reasoning}
          </p>
          <ConfidenceTag confidence={c.confidence} />
        </>
      ),
    });
  }

  if (state.database_design) {
    const d = state.database_design;
    sections.push({
      title: "Database",
      schema: "DatabaseDesign",
      node: (
        <>
          <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
            <span className="font-mono text-accent-300">{d.database_type}</span> · {d.reasoning} Partitioning: {d.partitioning_strategy}
          </p>
          {d.tables.map((table) => (
            <DatabaseTableBlock key={table.name} table={table} />
          ))}
          {d.relationships.length > 0 && (
            <>
              <p className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Relationships</p>
              <BulletList
                items={d.relationships.map((r) => `${r.from_table} → ${r.to_table} (${r.relationship_type}) — ${r.description}`)}
              />
            </>
          )}
          {d.sample_queries.length > 0 && (
            <>
              <p className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Sample queries</p>
              <div className="flex flex-col gap-1.5">
                {d.sample_queries.map((q, i) => (
                  <code key={i} className="block rounded-md bg-neutral-900 px-3 py-2 font-mono text-[12px] text-neutral-300">
                    {q}
                  </code>
                ))}
              </div>
            </>
          )}
          <ConfidenceTag confidence={d.confidence} />
        </>
      ),
    });
  }

  if (state.cache_design) {
    const c = state.cache_design;
    sections.push({
      title: "Cache",
      schema: "CacheDesign",
      node: (
        <>
          <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
            <span className="font-mono text-accent-300">
              {c.cache_type} · {c.cache_engine}
            </span>{" "}
            — {c.reasoning} Target hit ratio {c.cache_hit_ratio_target}, {c.consistency_model} consistency,{" "}
            {c.cache_aside_vs_write_through}.
          </p>
          <Table
            head={["Key pattern", "TTL", "Eviction", "Invalidated by"]}
            rows={c.cached_items.map((it: CachedItem) => [it.cache_key_pattern, `${it.ttl_seconds}s`, it.eviction_policy, it.invalidation_strategy])}
          />
          {c.hot_key_risk_notes && <p className="mt-4 text-[13px] leading-[22px] text-neutral-500">Hot-key risk: {c.hot_key_risk_notes}</p>}
          <ConfidenceTag confidence={c.confidence} />
        </>
      ),
    });
  }

  if (state.queue_expert) {
    const q = state.queue_expert;
    sections.push({
      title: "Queues",
      schema: "QueueDesign",
      node: (
        <>
          <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
            <span className="font-mono text-accent-300">
              {q.broker_type} · {q.broker_engine}
            </span>{" "}
            — {q.reasoning} Backpressure: {q.backpressure_strategy}. Scaling: {q.scaling_strategy}.
          </p>
          <Table
            head={["Topic", "Producer", "Consumer", "Delivery", "Ordering"]}
            rows={q.topics.map((t: QueueTopic) => [t.name, t.producer, t.consumer, t.delivery_guarantee, t.ordering_requirement])}
          />
          <ConfidenceTag confidence={q.confidence} />
        </>
      ),
    });
  }

  if (state.api_design) {
    const a = state.api_design;
    sections.push({
      title: "API",
      schema: "ApiDesign",
      node: (
        <>
          <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
            <span className="font-mono text-accent-300">{a.api_style}</span> under{" "}
            <code className="font-mono text-[13px] text-accent-300">{a.base_path}</code>, {a.auth_strategy}, {a.pagination_strategy}. {a.reasoning}
          </p>
          <Table
            head={["Method", "Path", "Purpose", "Auth"]}
            accentFirstCol
            rows={a.endpoints.map((e: ApiEndpoint) => [e.method, e.path, e.description, e.requires_auth ? "required" : "public"])}
          />
          <ConfidenceTag confidence={a.confidence} />
        </>
      ),
    });
  }

  if (state.cdn_design || state.storage_design) {
    sections.push({
      title: "CDN & storage",
      schema: [state.cdn_design && "CdnDesign", state.storage_design && "StorageDesign"].filter(Boolean).join(" · "),
      node: (
        <div className="grid grid-cols-1 gap-6.5 md:grid-cols-2">
          {state.cdn_design && (
            <div>
              <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Edge</p>
              <p className="m-0 text-[14px] leading-[25px] text-neutral-200">
                {state.cdn_design.needed
                  ? `${state.cdn_design.cdn_provider} — ${state.cdn_design.reasoning} ${state.cdn_design.edge_locations_strategy}`
                  : `Not needed. ${state.cdn_design.reasoning}`}
              </p>
              {state.cdn_design.needed && state.cdn_design.cached_content_types.length > 0 && (
                <p className="mt-2 font-mono text-[11.5px] text-neutral-500">
                  Caches: {state.cdn_design.cached_content_types.join(", ")}
                </p>
              )}
            </div>
          )}
          {state.storage_design && (
            <div>
              <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Object storage</p>
              <p className="m-0 text-[14px] leading-[25px] text-neutral-200">
                {state.storage_design.needed
                  ? `${state.storage_design.storage_provider} — ${state.storage_design.reasoning}`
                  : `Not needed. ${state.storage_design.reasoning}`}
              </p>
              {state.storage_design.needed && state.storage_design.buckets.length > 0 && (
                <Table
                  head={["Bucket", "Content", "Class", "Lifecycle"]}
                  rows={state.storage_design.buckets.map((b) => [b.name, b.content_type, b.storage_class, b.lifecycle_policy])}
                />
              )}
            </div>
          )}
        </div>
      ),
    });
  }

  if (state.microservice_design) {
    const m = state.microservice_design;
    sections.push({
      title: "Services",
      schema: "MicroserviceDesign",
      node: (
        <>
          <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">{m.decomposition_rationale}</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {m.services.map((s) => (
              <ServiceCard key={s.name} title={s.name} meta={s.responsibility} />
            ))}
          </div>
          {m.communications.length > 0 && (
            <>
              <p className="mb-2 mt-5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Communication</p>
              <BulletList
                items={m.communications.map((c) => `${c.from_service} → ${c.to_service} (${c.pattern}) — ${c.reason}`)}
              />
            </>
          )}
          {m.shared_concerns && <p className="mt-4 text-[13px] leading-[22px] text-neutral-500">Shared concerns: {m.shared_concerns}</p>}
        </>
      ),
    });
  }

  if (state.review_feedback) {
    const r = state.review_feedback;
    sections.push({
      title: "Review",
      schema: "ReviewFeedback",
      node: (
        <>
          <p className="mb-3 flex items-center gap-2 text-[14px] leading-[25px] text-neutral-300">
            <span className={`tag ${r.approved ? "tag-accent" : "tag-outline"} text-[10.5px]`}>{r.approved ? "approved" : "changes requested"}</span>
            {r.summary}
          </p>
          {r.issues.map((issue, i) => (
            <Callout key={i} tone={issue.severity === "blocker" ? "danger" : "warn"}>
              <strong className="font-medium text-neutral-200">{issue.target}</strong> — {issue.description}
              {issue.suggested_fix && <span className="block text-neutral-500">Suggested fix: {issue.suggested_fix}</span>}
            </Callout>
          ))}
        </>
      ),
    });
  }

  const onScroll = () => {
    const el = docRef.current;
    if (!el) return;
    const nextPct = el.scrollHeight > el.clientHeight ? Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100) : 100;
    let nextActive = 0;
    sectionRefs.current.forEach((r, i) => {
      if (r && r.offsetTop - el.scrollTop <= 120) nextActive = i;
    });
    if (nextPct !== pct) setPct(nextPct);
    if (nextActive !== active) setActive(nextActive);
  };

  const goTo = (i: number) => {
    const doc = docRef.current;
    const target = sectionRefs.current[i];
    if (doc && target) doc.scrollTo({ top: Math.max(0, target.offsetTop - 24), behavior: "smooth" });
  };

  const statusLabel = res.status === "failed" || res.status === "error" ? "failed" : "complete";
  const briefTitle = truncate(state.user_query ?? "Design", 64);

  return (
    <div className="grid h-screen grid-cols-1 bg-bg lg:grid-cols-[250px_minmax(0,1fr)]">
      <div
        className="hidden min-h-0 flex-col overflow-hidden border-r border-neutral-800 px-4.5 py-5 lg:flex"
        style={{ background: "color-mix(in srgb, var(--color-surface) 28%, transparent)" }}
      >
        <span className="mb-5 flex items-center gap-2.5 text-[14.5px] font-medium">
          <CompassTool weight="fill" size={17} className="text-accent" />
          Consultant
        </span>
        <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Contents</p>
        <div className="flex min-h-0 flex-1 flex-col gap-px overflow-hidden">
          {sections.map((s, i) => {
            const on = i === active;
            return (
              <div
                key={s.title}
                className="toc flex items-center gap-2.5 rounded-md px-2.5 py-1.5"
                style={{ background: on ? "color-mix(in srgb, var(--color-accent-900) 55%, transparent)" : "transparent" }}
                onClick={() => goTo(i)}
              >
                <span className="font-mono text-[10px]" style={{ color: on ? "var(--color-accent-300)" : "var(--color-neutral-600)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[12.5px]" style={{ color: on ? "var(--color-text)" : "var(--color-neutral-300)" }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 pt-3.5">
          <button type="button" className="btn btn-primary btn-block flex items-center justify-center gap-2" disabled>
            <FileMd size={14} />
            Export Markdown
          </button>
          <button type="button" className="btn btn-ghost btn-block flex items-center justify-center gap-2" disabled>
            <FilePdf size={14} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-neutral-800 px-8.5 py-4">
          <span className="flex-1 text-[13px] text-neutral-500">
            <Link href="/prompt">New design</Link> / document
          </span>
          <span className="tag tag-outline text-[10.5px]">
            {statusLabel} · {sections.length} of {MAX_SECTIONS}
          </span>
        </div>

        <div ref={docRef} onScroll={onScroll} className="doc min-h-0 flex-1 overflow-y-auto px-11 pb-15 pt-8.5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-accent">System design document</p>
          <h1 className="mb-2.5 max-w-[36ch] text-[30px] font-medium leading-[40px] tracking-[-0.018em]">{briefTitle}</h1>
          <p className="mb-6.5 font-mono text-[11.5px] text-neutral-600">
            thread {res.thread_id.slice(0, 4)}…{res.thread_id.slice(-3)} · qwen2.5:3b
            {assumptionCount > 0 && ` · ${assumptionCount} recorded assumption${assumptionCount === 1 ? "" : "s"}`}
          </p>

          {state.errors && state.errors.length > 0 && (
            <div className="mb-6.5 flex flex-col gap-2">
              {state.errors.map((e, i) => (
                <Callout key={i} tone="warn">
                  <strong className="font-medium text-neutral-200">{e.node}</strong> — {e.message} (attempt {e.attempt_count})
                </Callout>
              ))}
            </div>
          )}

          {sections.length === 0 && (
            <p className="text-[14px] leading-[25px] text-neutral-400">This run finished without producing any design artifacts.</p>
          )}

          {sections.map((s, i) => (
            <SectionBlock
              key={s.title}
              id={i}
              refs={sectionRefs}
              num={String(i + 1).padStart(2, "0")}
              title={s.title}
              schema={s.schema}
            >
              {s.node}
            </SectionBlock>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-neutral-800 px-8.5 py-3.5 font-mono text-[11.5px] text-neutral-600">
          <span>
            {sections.length} section{sections.length === 1 ? "" : "s"}
          </span>
          <span className="ml-auto flex items-center gap-3">
            <span className="text-neutral-500">{pct}% read</span>
            <span className="h-1 w-30 overflow-hidden rounded-full bg-neutral-800">
              <span className="block h-full bg-accent transition-[width] duration-200 linear" style={{ width: `${pct}%` }} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  id,
  refs,
  num,
  title,
  schema,
  children,
}: {
  id: number;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  num: string;
  title: string;
  schema: string;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={(el) => {
        refs.current[id] = el;
      }}
      className={`sec border-t border-neutral-800 pt-5.5 ${id > 0 ? "mt-6.5" : ""}`}
    >
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-xs text-accent-300">{num}</span>
        <h2 className="m-0 flex-1 text-[20px] font-medium leading-7">{title}</h2>
        <span className="tag tag-outline font-mono text-[10px]">{schema}</span>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10.5px] text-neutral-500">{label}</p>
      <p className="m-0 text-[24px] font-medium tabular-nums">{value}</p>
    </div>
  );
}

function Assumption({ n, total, children }: { n: number; total: number; children: React.ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-1.5 text-[12.5px] leading-[21px] text-neutral-500">
      <Info size={13} className="mt-1 flex-none text-accent-300" />
      Assumption {n} of {total} — {children}
    </p>
  );
}

function ConfidenceTag({ confidence }: { confidence: string }) {
  return <span className="tag tag-outline mt-4 inline-block text-[10px]">confidence: {confidence}</span>;
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="m-0 text-[13px] text-neutral-600">—</p>;
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[14px] leading-[24px] text-neutral-200">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-neutral-600">·</span>
          {it}
        </li>
      ))}
    </ul>
  );
}

function Callout({ tone, children }: { tone: "warn" | "danger"; children: React.ReactNode }) {
  const color = tone === "danger" ? "#e08a83" : "#e0c083";
  return (
    <p
      className="mt-3 flex items-start gap-1.5 rounded-md px-3 py-2.5 text-[12.5px] leading-[21px] text-neutral-400"
      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 35%, transparent)` }}
    >
      <WarningCircle size={13} className="mt-0.5 flex-none" style={{ color }} />
      <span>{children}</span>
    </p>
  );
}

function Table({ head, rows, accentFirstCol }: { head: string[]; rows: string[][]; accentFirstCol?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td
                  key={j}
                  className={j === 0 ? "font-mono" : "text-neutral-400"}
                  style={j === 0 && accentFirstCol ? { color: "var(--color-accent-300)" } : undefined}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DatabaseTableBlock({ table }: { table: TableArtifact }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[13px] leading-[21px] text-neutral-300">
        <span className="font-mono text-accent-300">{table.name}</span> — {table.description}{" "}
        <span className="text-neutral-600">({table.estimated_row_count} rows est.)</span>
      </p>
      <Table
        head={["Column", "Type", "Constraints", "Description"]}
        rows={table.columns.map((c) => [c.name, c.data_type, c.constraints.join(", ") || "—", c.description])}
      />
      {table.indexes.length > 0 && (
        <p className="mt-2 font-mono text-[11px] text-neutral-500">
          Indexes: {table.indexes.map((idx) => `${idx.name} (${idx.columns.join(", ")})`).join(" · ")}
        </p>
      )}
    </div>
  );
}

function ServiceCard({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-lg border px-3.5 py-3" style={{ borderColor: "var(--color-neutral-800)" }}>
      <p className="m-0 mb-1 text-[13px] leading-[19px]">{title}</p>
      <p className="m-0 font-mono text-[10.5px] text-neutral-500">{meta}</p>
    </div>
  );
}
