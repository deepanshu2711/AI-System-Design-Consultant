"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompassTool, CheckCircle, CircleDashed, TerminalWindow, FileText, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import AppNav from "@/components/AppNav";
import { isWaitingForInput, openRunStream } from "@/lib/api";
import { loadRunSession, saveClarifySession } from "@/lib/session";
import { AGENTS } from "@/lib/agents";

type NodeSpec = {
  title: string;
  /** Backend LangGraph node name(s) this box represents — more than one for the combined CDN+Storage box. */
  nodes: string[];
  pos: { left?: number; right?: number; width: number; justify: "flex-start" | "center" };
  top: number;
  edge: string;
};

const NODES: NodeSpec[] = [
  { title: "Clarifying Questions", nodes: ["clarifying_questions_agent"], pos: { left: 26, width: 186, justify: "flex-start" }, top: 104, edge: "M418 330 L212 133" },
  { title: "Requirement Analyzer", nodes: ["requirement_analyzer_agent"], pos: { left: 26, width: 186, justify: "flex-start" }, top: 216, edge: "M418 330 L212 245" },
  { title: "Traffic Estimator", nodes: ["traffic_estimator_agent"], pos: { left: 26, width: 186, justify: "flex-start" }, top: 396, edge: "M418 330 L212 425" },
  { title: "Capacity Planner", nodes: ["capacity_planner_agent"], pos: { left: 26, width: 186, justify: "flex-start" }, top: 508, edge: "M418 330 L212 537" },
  { title: "Database Designer", nodes: ["database_designer_agent"], pos: { right: 26, width: 186, justify: "flex-start" }, top: 104, edge: "M418 330 L624 133" },
  { title: "Cache Expert", nodes: ["cache_expert_agent"], pos: { right: 26, width: 186, justify: "flex-start" }, top: 216, edge: "M418 330 L624 245" },
  { title: "Queue Expert", nodes: ["queue_expert_agent"], pos: { right: 26, width: 186, justify: "flex-start" }, top: 396, edge: "M418 330 L624 425" },
  { title: "API Designer", nodes: ["api_designer_agent"], pos: { right: 26, width: 186, justify: "flex-start" }, top: 508, edge: "M418 330 L624 537" },
  { title: "CDN Expert & Storage Expert", nodes: ["cdn_expert_agent", "storage_expert_agent"], pos: { left: 288, width: 260, justify: "center" }, top: 64, edge: "M418 330 L418 122" },
  { title: "Microservice Expert", nodes: ["microservice_expert_agent"], pos: { left: 224, width: 180, justify: "center" }, top: 536, edge: "M418 330 L314 536" },
  { title: "Architecture Reviewer", nodes: ["architecture_review_cycle"], pos: { left: 432, width: 180, justify: "center" }, top: 536, edge: "M418 330 L522 536" },
];

const TOTAL_NODES = NODES.reduce((n, spec) => n + spec.nodes.length, 0);

function clock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function titleFor(node: string) {
  return AGENTS.find((a) => a.node === node)?.title ?? node;
}

type LogLine = { t: string; msg: string; color: string };
type RunStatus = "connecting" | "running" | "complete" | "error";

export default function RunScreen() {
  const router = useRouter();
  const [threadId, setThreadId] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [doneNodes, setDoneNodes] = useState<Set<string>>(new Set());
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const nodeStartedAtRef = useRef<Map<string, number>>(new Map());
  const [status, setStatus] = useState<RunStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [log, setLog] = useState<LogLine[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef(Date.now());

  const pushLog = (msg: string, color = "var(--color-neutral-300)") => {
    const t = clock(Math.floor((Date.now() - startedAtRef.current) / 1000));
    setLog((prev) => [...prev.slice(-40), { t, msg, color }]);
  };

  useEffect(() => {
    const session = loadRunSession();
    if (!session) {
      router.replace("/prompt");
      return;
    }
    setThreadId(session.threadId);
    setUserQuery(session.userQuery);
    startedAtRef.current = Date.now();
    pushLog(`connecting to thread ${session.threadId.slice(0, 8)}…`, "var(--color-neutral-500)");

    const source = openRunStream(session.threadId, {
      onNodeStart: (node) => {
        setStatus("running");
        setActiveNode(node);
        nodeStartedAtRef.current.set(node, Date.now());
        pushLog(`supervisor → ${node}`);
      },
      onNodeEnd: (node) => {
        setDoneNodes((prev) => new Set(prev).add(node));
        setActiveNode((cur) => (cur === node ? null : cur));
        pushLog(`${node} ✓`, "var(--color-accent-300)");
      },
      onTerminal: (res) => {
        if (isWaitingForInput(res)) {
          pushLog(`interrupt · ${res.questions.length} question${res.questions.length === 1 ? "" : "s"}`, "var(--color-accent-300)");
          saveClarifySession({
            threadId: res.thread_id,
            userQuery: session.userQuery,
            message: res.message,
            questions: res.questions,
            round: 1,
          });
          router.push("/clarify");
          return;
        }
        setActiveNode(null);
        if (res.status === "error") {
          setStatus("error");
          setErrorMessage(res.message ?? "The run failed.");
          pushLog("run failed", "#e08a83");
        } else {
          setStatus("complete");
          pushLog(`${res.status} → END`, "var(--color-accent-300)");
        }
      },
      onError: () => {
        pushLog("connection interrupted — retrying…", "#e08a83");
      },
    });

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "complete" || status === "error") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

useEffect(() => {
  if (!threadId) return;
  const box = boxRef.current;
  const inner = innerRef.current;
  if (!box || !inner) return;

  const fit = () => {
    const s = Math.min(1, box.clientWidth / 836, box.clientHeight / 660);
    inner.style.transform = `scale(${s})`;
    inner.style.marginLeft = `${(box.clientWidth - 836 * s) / 2}px`;
    inner.style.marginTop = `${(box.clientHeight - 660 * s) / 2}px`;
  };

  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(box);
  window.addEventListener("resize", fit);
  return () => {
    ro.disconnect();
    window.removeEventListener("resize", fit);
  };
}, [threadId]);

  const doneCount = doneNodes.size;
  const done = status === "complete";
  // Recomputed on every `elapsed` tick (re-render) so it counts up live;
  // plain seconds since the node started, not clock()'d — a run only ever
  // shows one active node at a time, and node durations run well under a
  // minute, so a "00:" minutes prefix (elapsed % 60) was always zero and
  // never actually meant anything.
  const activeSeconds = activeNode
    ? Math.floor((Date.now() - (nodeStartedAtRef.current.get(activeNode) ?? Date.now())) / 1000)
    : 0;
  const activeTitle = useMemo(
    () => (activeNode ? NODES.find((n) => n.nodes.includes(activeNode))?.title ?? activeNode : undefined),
    [activeNode]
  );
  const visibleLog = log.slice(-11);

  if (!threadId) return null;

  return (
    <div className="grid h-screen grid-cols-1 bg-bg lg:grid-cols-[minmax(0,1fr)_344px]">
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-neutral-800 lg:border-r">
        <AppNav
          crumb={userQuery.length > 48 ? userQuery.slice(0, 48) + "…" : userQuery}
          right={
            <span className={`tag ${done ? "tag-outline" : status === "error" ? "tag-outline" : "tag-accent"} inline-flex items-center gap-1.5`}>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: status === "error" ? "#e08a83" : "var(--color-accent)", animation: "dotPulse 1.4s ease-in-out infinite" }}
              />
              {status === "connecting" && "connecting…"}
              {status === "running" && `running · ${doneCount} of ${TOTAL_NODES}`}
              {status === "complete" && `complete · ${doneCount} of ${TOTAL_NODES}`}
              {status === "error" && "failed"}
            </span>
          }
        />

        <div
          className="grid min-h-0 flex-1 place-items-center overflow-hidden"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-surface) 22%, transparent)",
            backgroundImage:
              "radial-gradient(circle at center, var(--color-neutral-900) 1px, transparent 1px), radial-gradient(420px 300px at 50% 46%, color-mix(in srgb, var(--color-accent-900) 62%, transparent), transparent 70%)",
            backgroundSize: "26px 26px, auto",
          }}
        >
          <div ref={boxRef} className="block h-full w-full overflow-hidden">
            <div ref={innerRef} className="relative" style={{ transformOrigin: "top left", width: 836, height: 660 }}>
              <svg viewBox="0 0 836 660" width={836} height={660} className="absolute inset-0" aria-hidden>
                <g stroke="var(--color-neutral-700)" strokeWidth={1} fill="none">
                  {NODES.map((n) => (
                    <path key={n.edge} d={n.edge} />
                  ))}
                </g>
                <g fill="none" strokeWidth={1.4}>
                  {NODES.map((n) => {
                    const allDone = n.nodes.every((name) => doneNodes.has(name));
                    const isActive = n.nodes.includes(activeNode ?? "");
                    const isReached = allDone || isActive;
                    return (
                      <path
                        key={n.edge}
                        className="edge"
                        d={n.edge}
                        stroke={isReached ? "var(--color-accent)" : "transparent"}
                        opacity={isReached ? 1 : 0}
                        strokeDasharray={isActive ? "5 10" : "none"}
                        style={isActive ? { animation: "dashFlow 4s linear infinite" } : undefined}
                      />
                    );
                  })}
                </g>
                <circle
                  cx={418}
                  cy={330}
                  r={98}
                  fill="none"
                  stroke="var(--color-accent-700)"
                  strokeWidth={1}
                  style={{ transformOrigin: "418px 330px", animation: "ringPulse 4s ease-in-out infinite" }}
                />
                <circle cx={418} cy={330} r={74} fill="color-mix(in srgb, var(--color-accent-900) 74%, var(--color-bg))" stroke="var(--color-accent)" strokeWidth={1.4} />
              </svg>

              <div className="absolute w-33 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: 418, top: 330 }}>
                <CompassTool weight="fill" size={20} className="mx-auto text-accent" />
                <p className="m-0 mb-0.5 mt-1.5 text-[14px] font-medium leading-5">Supervisor</p>
                <p className="m-0 font-mono text-[10px] leading-[15px] text-neutral-500">
                  {done ? "→ END" : activeTitle ? `→ ${activeTitle.split(" ")[0].toLowerCase()}` : "…"}
                </p>
              </div>

              {NODES.map((n) => {
                const isDone = n.nodes.every((name) => doneNodes.has(name));
                const isActive = !isDone && n.nodes.includes(activeNode ?? "");
                const isQueued = !isDone && !isActive;
                return (
                  <div
                    key={n.title}
                    className={`node absolute box-border flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${isActive ? "sheen" : ""}`}
                    style={{
                      position: "absolute",
                      top: n.top,
                      left: n.pos.left,
                      right: n.pos.right,
                      width: n.pos.width,
                      justifyContent: n.pos.justify,
                      border: `1px ${isDone || isActive ? "solid" : "dashed"} ${
                        isActive ? "var(--color-accent)" : isDone ? "var(--color-accent-800)" : "var(--color-neutral-700)"
                      }`,
                      background: isActive
                        ? "color-mix(in srgb, var(--color-accent-900) 82%, var(--color-surface))"
                        : isDone
                          ? "color-mix(in srgb, var(--color-accent-900) 62%, var(--color-surface))"
                          : "transparent",
                      boxShadow: isActive ? "0 0 0 3px color-mix(in srgb, var(--color-accent-900) 45%, transparent), 0 12px 30px rgba(0,0,0,.5)" : "none",
                      opacity: isDone || isActive ? 1 : 0.72,
                    }}
                  >
                    {isDone && <CheckCircle weight="fill" size={15} className="flex-none text-accent" style={{ animation: "popIn .4s cubic-bezier(.16,.84,.3,1) both" }} />}
                    {isActive && (
                      <span
                        className="flex-none grid h-3.5 w-3.5 place-items-center rounded-full border border-accent"
                        style={{ animation: "dotPulse 1.4s ease-in-out infinite" }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      </span>
                    )}
                    {isQueued && <CircleDashed size={15} className="flex-none text-neutral-600" />}
                    <span className="min-w-0">
                      <span className="block text-[12.5px] leading-[17px]" style={{ color: isDone || isActive ? "var(--color-text)" : "var(--color-neutral-300)" }}>
                        {n.title}
                      </span>
                      <span className="block font-mono text-[9.5px] leading-[14px]" style={{ color: isActive ? "var(--color-accent-300)" : "var(--color-neutral-600)" }}>
                        {isDone ? "done" : isActive ? `working · ${activeSeconds}s` : "queued"}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-neutral-800 px-6.5 py-3.5">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-800">
            <div className="fill h-full bg-accent" style={{ width: `${Math.round((doneCount / TOTAL_NODES) * 100)}%` }} />
          </div>
          <span className="font-mono text-[11.5px] text-neutral-500">
            {doneCount} of {TOTAL_NODES} filled · {clock(elapsed)}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-surface) 26%, transparent)" }}>
        <div className="flex items-center gap-2.5 border-b border-neutral-800 px-5 pb-3.5 pt-4.5">
          <TerminalWindow size={15} className="text-accent" />
          <span className="flex-1 font-mono text-[11.5px] uppercase tracking-wide text-neutral-400">Run log</span>
          <span className="font-mono text-[11px] text-neutral-600">{done ? "finished" : status === "error" ? "failed" : "live"}</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden px-5 py-4 font-mono text-[11.5px] leading-[21px]">
          {visibleLog.map((l, i) => (
            <p key={i} className="m-0 text-neutral-600" style={{ animation: "logIn .4s ease both" }}>
              {l.t} <span style={{ color: l.color }}>{l.msg}</span>
            </p>
          ))}
          {status === "running" && (
            <p className="m-0 text-accent-300">
              {activeTitle ? `  ${titleFor(activeNode ?? "")} working…` : ""}
              <span className="ml-1 inline-block h-3 w-1.5 align-[-1px] bg-accent" style={{ animation: "caret 1.1s step-end infinite" }} />
            </p>
          )}
        </div>

        {status === "error" && (
          <div className="border-t px-5 py-3.5" style={{ borderColor: "#c0524a", background: "color-mix(in srgb, #c0524a 14%, transparent)" }}>
            <p className="m-0 flex items-center gap-2 text-[13px] leading-5 text-neutral-200">
              <WarningCircle size={16} style={{ color: "#e08a83" }} />
              {errorMessage}
            </p>
          </div>
        )}

        {done && (
          <div className="border-t border-accent-800 px-5 py-3.5" style={{ background: "color-mix(in srgb, var(--color-accent-900) 55%, transparent)", animation: "fadeIn .6s ease both" }}>
            <p className="mb-2.5 flex items-center gap-2 text-[13px] leading-5 text-neutral-200">
              <CheckCircle size={16} className="text-accent" />
              All {TOTAL_NODES} stages filled — document assembled.
            </p>
            <Link href={`/document?thread=${threadId}`} className="btn btn-primary btn-block flex items-center justify-center gap-2">
              <FileText size={14} />
              Open design document
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-2.5 border-t border-neutral-800 px-5 py-3.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-300" style={{ animation: "dotPulse 2.2s ease-in-out infinite" }} />
            qwen2.5:3b · local
          </div>
          <div className="font-mono text-[11px] text-neutral-600">
            thread {threadId.slice(0, 4)}…{threadId.slice(-3)} · in-memory checkpoint
          </div>
        </div>
      </div>
    </div>
  );
}
