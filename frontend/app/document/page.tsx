"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CompassTool, FileMd, FilePdf, Info } from "@phosphor-icons/react/dist/ssr";

const TOC: [string, string][] = [
  ["01", "Requirements"],
  ["02", "Traffic"],
  ["03", "Capacity"],
  ["04", "Database"],
  ["05", "Cache"],
  ["06", "Queues"],
  ["07", "API"],
  ["08", "CDN & storage"],
  ["09", "Services"],
];

export default function DocumentScreen() {
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const [exported, setExported] = useState(false);
  const exportTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const docRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const exportMd = () => {
    setExported(true);
    clearTimeout(exportTimer.current);
    exportTimer.current = setTimeout(() => setExported(false), 1800);
  };

  const goTo = (i: number) => {
    const doc = docRef.current;
    const target = sectionRefs.current[i];
    if (doc && target) doc.scrollTo({ top: Math.max(0, target.offsetTop - 24), behavior: "smooth" });
  };

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
          {TOC.map(([num, label], i) => {
            const on = i === active;
            return (
              <div
                key={num}
                className="toc flex items-center gap-2.5 rounded-md px-2.5 py-1.5"
                style={{ background: on ? "color-mix(in srgb, var(--color-accent-900) 55%, transparent)" : "transparent" }}
                onClick={() => goTo(i)}
              >
                <span className="font-mono text-[10px]" style={{ color: on ? "var(--color-accent-300)" : "var(--color-neutral-600)" }}>
                  {num}
                </span>
                <span className="flex-1 text-[12.5px]" style={{ color: on ? "var(--color-text)" : "var(--color-neutral-300)" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 pt-3.5">
          <button type="button" className="btn btn-primary btn-block flex items-center justify-center gap-2" onClick={exportMd}>
            <FileMd size={14} />
            {exported ? "Copied to clipboard" : "Export Markdown"}
          </button>
          <button type="button" className="btn btn-ghost btn-block flex items-center justify-center gap-2">
            <FilePdf size={14} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-neutral-800 px-8.5 py-4">
          <span className="flex-1 text-[13px] text-neutral-500">
            <Link href="/prompt">New design</Link> / <Link href="/run">Instagram-like feed</Link> / document
          </span>
          <span className="tag tag-outline text-[10.5px]">complete · 11 of 11</span>
          <span className="font-mono text-[11.5px] text-neutral-600">04:38 · 6 tool calls</span>
        </div>

        <div ref={docRef} onScroll={onScroll} className="doc min-h-0 flex-1 overflow-y-auto px-11 pb-15 pt-8.5">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-accent">System design document</p>
          <h1 className="mb-2.5 max-w-[26ch] text-[34px] font-medium leading-[44px] tracking-[-0.018em]">
            A photo and short-video sharing platform
          </h1>
          <p className="mb-2 max-w-[70ch] text-[15px] leading-[27px] text-neutral-300">
            Ranked feed, media uploads, follow graph and notifications, at 10M DAU across two regions. Generated from your
            brief by eleven agents; every figure below came back typed and validated.
          </p>
          <p className="mb-6.5 font-mono text-[11.5px] text-neutral-600">thread a1f9…c72 · qwen2.5:3b · 3 recorded assumptions</p>

          <Section id={0} refs={sectionRefs} num="01" title="Requirements" schema="RequirementSpec">
            <div className="grid grid-cols-1 gap-6.5 md:grid-cols-2">
              <div>
                <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Functional</p>
                <p className="m-0 text-[14px] leading-[25px] text-neutral-200">
                  Upload photos and video up to 60s · ranked home feed · follow and unfollow · likes and comments ·
                  notifications on engagement · profile with post grid · search by handle
                </p>
              </div>
              <div>
                <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Non-functional</p>
                <p className="m-0 text-[14px] leading-[25px] text-neutral-200">
                  Feed p99 under 200ms · 99.95% availability · reads served from the nearest region · uploads durable
                  before ack · eventual consistency on counters
                </p>
              </div>
            </div>
            <Assumption n={1}>direct messaging is out of scope; it was never stated in the brief.</Assumption>
          </Section>

          <Section id={1} refs={sectionRefs} num="02" title="Traffic" schema="TrafficEstimate">
            <div className="mb-4 grid grid-cols-2 gap-4.5 sm:grid-cols-5">
              <Stat label="DAU" value="10M" />
              <Stat label="MAU" value="42M" />
              <Stat label="Avg RPS" value="29k" />
              <Stat label="Peak RPS" value="86k" />
              <Stat label="Read : write" value="100:1" />
            </div>
            <p className="m-0 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
              Average request 2.1 KB, average response 1.4 MB once media is inlined. Peak is 3× average, assumed to fall
              in a two-hour evening window per region.
            </p>
          </Section>

          <Section id={2} refs={sectionRefs} num="03" title="Capacity" schema="CapacityPlan">
            <div className="mb-4 grid grid-cols-2 gap-4.5 sm:grid-cols-4">
              <Stat label="Storage / day" value="14 TB" />
              <Stat label="Storage / year" value="5.1 PB" />
              <Stat label="Egress at peak" value="120 Gb/s" />
              <Stat label="App nodes" value="240" />
            </div>
            <p className="m-0 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
              Replication factor 3 within each region, one asynchronous cross-region copy. Node count assumes 400 RPS per
              app instance at 60% headroom.
            </p>
          </Section>

          <Section id={3} refs={sectionRefs} num="04" title="Database" schema="DatabaseDesign">
            <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
              PostgreSQL for the follow graph and metadata, Cassandra for timelines and high-write counters. Sharded by{" "}
              <code className="font-mono text-[13px] text-accent-300">user_id</code> across 64 shards.
            </p>
            <Table
              head={["Table", "Engine", "Partition key", "Indexes"]}
              rows={[
                ["users", "PostgreSQL", "user_id", "handle, email"],
                ["follows", "PostgreSQL", "follower_id", "followee_id"],
                ["posts", "PostgreSQL", "user_id, created_month", "created_at desc"],
                ["media_assets", "PostgreSQL", "post_id", "status"],
                ["timeline", "Cassandra", "user_id", "clustered by rank"],
                ["likes", "Cassandra", "post_id", "—"],
                ["comments", "PostgreSQL", "post_id", "created_at"],
                ["notifications", "Cassandra", "user_id", "unread"],
              ]}
            />
            <Assumption n={2}>fan-out on write under 10k followers, fan-out on read above it.</Assumption>
          </Section>

          <Section id={4} refs={sectionRefs} num="05" title="Cache" schema="CacheDesign">
            <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
              Redis cluster per region, read-through with write-invalidate. Target hit ratio 92%; a hot-key guard shards
              celebrity timelines across 8 replicas.
            </p>
            <Table
              head={["Key pattern", "TTL", "Eviction", "Invalidated by"]}
              rows={[
                ["feed:{user}:{page}", "30s", "allkeys-lru", "new post fan-out"],
                ["post:{id}", "10m", "allkeys-lru", "edit, delete"],
                ["profile:{handle}", "5m", "allkeys-lru", "profile update"],
                ["counts:{post}", "60s", "volatile-ttl", "periodic rollup"],
              ]}
            />
          </Section>

          <Section id={5} refs={sectionRefs} num="06" title="Queues" schema="QueueDesign">
            <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
              Kafka, at-least-once with idempotent consumers. Three retries with exponential backoff, then a dead-letter
              topic per subject.
            </p>
            <Table
              head={["Topic", "Partitions", "Consumers", "Ordering"]}
              rows={[
                ["post.created", "64", "feed fan-out, search", "per user_id"],
                ["media.uploaded", "32", "transcoder", "per post_id"],
                ["engagement", "32", "notifier, analytics", "none required"],
                ["counter.rollup", "16", "counts writer", "per post_id"],
              ]}
            />
          </Section>

          <Section id={6} refs={sectionRefs} num="07" title="API" schema="ApiDesign">
            <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
              REST under <code className="font-mono text-[13px] text-accent-300">/v1</code>, bearer tokens, cursor
              pagination. Eighteen endpoints; the six that carry the feed are below.
            </p>
            <Table
              head={["Method", "Path", "Purpose", "Notes"]}
              accentFirstCol
              rows={[
                ["GET", "/v1/feed", "Ranked home feed", "cursor, 20 per page"],
                ["POST", "/v1/posts", "Create a post", "idempotency key"],
                ["POST", "/v1/media/upload-url", "Signed upload URL", "15m expiry"],
                ["PUT", "/v1/follows/{id}", "Follow a user", "idempotent"],
                ["GET", "/v1/users/{handle}", "Profile and post grid", "cacheable 5m"],
                ["GET", "/v1/notifications", "Unread notifications", "long poll 30s"],
              ]}
            />
          </Section>

          <Section id={7} refs={sectionRefs} num="08" title="CDN & storage" schema="CdnDesign · StorageDesign">
            <div className="grid grid-cols-1 gap-6.5 md:grid-cols-2">
              <div>
                <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Edge</p>
                <p className="m-0 text-[14px] leading-[25px] text-neutral-200">
                  Images and video segments cached 7 days at the edge, signed URLs with 15-minute expiry, cache key on
                  asset id and rendition. Purge on delete; renditions are immutable, so edits mint a new id.
                </p>
              </div>
              <div>
                <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Object storage</p>
                <p className="m-0 text-[14px] leading-[25px] text-neutral-200">
                  Three buckets — originals, renditions, thumbnails. Standard for 90 days, then infrequent access;
                  originals to cold at one year. Versioning on originals only.
                </p>
              </div>
            </div>
          </Section>

          <Section id={8} refs={sectionRefs} num="09" title="Services" schema="MicroserviceDesign">
            <p className="mb-4 max-w-[74ch] text-[14px] leading-[25px] text-neutral-300">
              Seven services behind a gateway. Reads are synchronous; every write that fans out goes through Kafka, so a
              slow consumer never blocks a post.
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <ServiceCard title="Gateway" meta="auth, rate limits" />
              <ServiceCard title="User" meta="profiles, follows" />
              <ServiceCard title="Post" meta="writes, comments" />
              <ServiceCard title="Feed" meta="ranking, fan-out" />
              <ServiceCard title="Media" meta="upload, transcode" />
              <ServiceCard title="Notify" meta="push, in-app" />
              <ServiceCard title="Search" meta="handles, tags" />
              <ServiceCard title="Assumption 3" meta="no ML ranking service" accent />
            </div>
            <p className="mt-5 text-[12.5px] leading-[21px] text-neutral-500">
              End of document · generated by 11 agents in 04:38 · qwen2.5:3b
            </p>
          </Section>
        </div>

        <div className="flex items-center gap-4 border-t border-neutral-800 px-8.5 py-3.5 font-mono text-[11.5px] text-neutral-600">
          <span>9 sections · 13 typed artifacts</span>
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

function Section({
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

function Assumption({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-1.5 text-[12.5px] leading-[21px] text-neutral-500">
      <Info size={13} className="mt-1 flex-none text-accent-300" />
      Assumption {n} of 3 — {children}
    </p>
  );
}

function Table({
  head,
  rows,
  accentFirstCol,
}: {
  head: string[];
  rows: string[][];
  accentFirstCol?: boolean;
}) {
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

function ServiceCard({ title, meta, accent }: { title: string; meta: string; accent?: boolean }) {
  return (
    <div
      className="rounded-lg border px-3.5 py-3"
      style={{
        borderColor: accent ? "var(--color-accent-800)" : "var(--color-neutral-800)",
        background: accent ? "color-mix(in srgb, var(--color-accent-900) 50%, transparent)" : "transparent",
      }}
    >
      <p className="m-0 mb-1 text-[13px] leading-[19px]">{title}</p>
      <p className="m-0 font-mono text-[10.5px] text-neutral-500">{meta}</p>
    </div>
  );
}
