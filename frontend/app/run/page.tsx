"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CompassTool, CheckCircle, CircleDashed, TerminalWindow, FileText, Pause, Play, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import AppNav from "@/components/AppNav";

type NodeSpec = {
  title: string;
  side: "L" | "R" | "T" | "B";
  top: number;
  edge: string;
  secs: number;
  log: string;
  tool?: string;
  wide?: boolean;
};

const NODES: NodeSpec[] = [
  { title: "Clarifying Questions", side: "L", top: 104, edge: "M418 330 L212 133", secs: 0.4, log: "clarifying_questions ✓ · 4 answered" },
  { title: "Requirement Analyzer", side: "L", top: 216, edge: "M418 330 L212 245", secs: 18.2, log: "requirement_analyzer ✓ · RequirementSpec" },
  { title: "Traffic Estimator", side: "L", top: 396, edge: "M418 330 L212 425", secs: 31.6, log: "traffic_estimator ✓ · 10M DAU · 86k peak RPS", tool: "calculator(10e6*30)" },
  { title: "Capacity Planner", side: "L", top: 508, edge: "M418 330 L212 537", secs: 27.9, log: "capacity_planner ✓ · 5.1 PB/yr · 240 nodes", tool: "calculator(5.1e15/240)" },
  { title: "Database Designer", side: "R", top: 104, edge: "M418 330 L624 133", secs: 24.1, log: "database_designer ✓ · 9 tables · 14 indexes" },
  { title: "Cache Expert", side: "R", top: 216, edge: "M418 330 L624 245", secs: 16.8, log: "cache_expert ✓ · 6 key patterns · 92% target" },
  { title: "Queue Expert", side: "R", top: 396, edge: "M418 330 L624 425", secs: 15.2, log: "queue_expert ✓ · 4 topics · at-least-once" },
  { title: "API Designer", side: "R", top: 508, edge: "M418 330 L624 537", secs: 21.5, log: "api_designer ✓ · 18 endpoints" },
  { title: "CDN Expert & Storage Expert", side: "T", top: 64, edge: "M418 330 L418 122", secs: 29.4, log: "cdn_expert ✓ storage_expert ✓ · media branch", wide: true },
  { title: "Microservice Expert", side: "B", top: 536, edge: "M418 330 L418 536", secs: 33.7, log: "microservice_expert ✓ → END", wide: true },
];

function clock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RunScreen() {
  const [stage, setStage] = useState(4);
  const [elapsed, setElapsed] = useState(134);
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    const fit = () => {
      const box = boxRef.current;
      const inner = innerRef.current;
      if (!box || !inner) return;
      const s = Math.min(1, box.clientWidth / 836, box.clientHeight / 660);
      inner.style.transform = `scale(${s})`;
      inner.style.marginLeft = `${(box.clientWidth - 836 * s) / 2}px`;
      inner.style.marginTop = `${(box.clientHeight - 660 * s) / 2}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (boxRef.current) ro.observe(boxRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current) return;
      setTick((t) => {
        const next = t + 1;
        setElapsed((e) => e + 1);
        if (next % 6 === 0) {
          setStage((s) => Math.min(NODES.length, s + 1));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const done = stage >= NODES.length;
  const activeIdx = done ? -1 : stage;
  const active = activeIdx >= 0 ? NODES[activeIdx] : undefined;

  const log: { t: string; msg: string; color: string }[] = [];
  log.push({ t: "00:00", msg: "supervisor → clarifying_questions", color: "var(--color-neutral-300)" });
  log.push({ t: "00:00", msg: "interrupt · 4 questions", color: "var(--color-accent-300)" });
  let at = 4;
  NODES.slice(0, stage).forEach((n) => {
    at += Math.round(n.secs);
    if (n.tool) log.push({ t: clock(at - 2), msg: `tool: ${n.tool}`, color: "var(--color-neutral-400)" });
    log.push({ t: clock(at), msg: n.log, color: "var(--color-neutral-300)" });
  });
  if (active) {
    log.push({
      t: clock(at + 2),
      msg: `supervisor → ${active.title.toLowerCase().replace(/ & /g, " + ").replace(/ /g, "_")}`,
      color: "var(--color-neutral-300)",
    });
  }
  const visibleLog = log.slice(-11);

  return (
    <div className="grid h-screen grid-cols-1 bg-bg lg:grid-cols-[minmax(0,1fr)_344px]">
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-neutral-800 lg:border-r">
        <AppNav
          crumb="Instagram-like feed"
          right={
            <>
              <span className={`tag ${done ? "tag-outline" : "tag-accent"} inline-flex items-center gap-1.5`}>
                <span className="h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: "dotPulse 1.4s ease-in-out infinite" }} />
                {done ? "complete · 11 of 11" : running ? `running · stage ${stage + 1} of 11` : `paused · stage ${stage + 1}`}
              </span>
              <button type="button" className="btn btn-ghost flex items-center gap-2" onClick={() => setRunning((r) => !r)}>
                {running ? <Pause size={14} /> : <Play size={14} />}
                {running ? "Pause" : "Resume"}
              </button>
              <button
                type="button"
                className="btn btn-ghost flex items-center gap-2"
                onClick={() => {
                  setStage(0);
                  setElapsed(0);
                  setTick(0);
                  setRunning(true);
                }}
              >
                <ArrowCounterClockwise size={14} />
                Restart
              </button>
            </>
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
                  {NODES.map((n, i) => {
                    const isActive = i === activeIdx;
                    return (
                      <path
                        key={n.edge}
                        className="edge"
                        d={n.edge}
                        stroke={i <= stage ? "var(--color-accent)" : "transparent"}
                        opacity={i <= stage ? 1 : 0}
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
                  {done ? "→ END" : `→ ${active ? active.title.split(" ")[0].toLowerCase() : ""}`}
                </p>
              </div>

              {NODES.map((n, i) => {
                const isDone = i < stage;
                const isActive = i === activeIdx;
                const isQueued = !isDone && !isActive;
                const pos =
                  n.side === "L"
                    ? { left: 26, width: 186, justify: "flex-start" as const }
                    : n.side === "R"
                      ? { right: 26, width: 186, justify: "flex-start" as const }
                      : { left: 288, width: 260, justify: "center" as const };
                return (
                  <div
                    key={n.title}
                    className={`node absolute box-border flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${isActive ? "sheen" : ""}`}
                    style={{
                      position: "absolute",
                      top: n.top,
                      left: "left" in pos ? pos.left : undefined,
                      right: "right" in pos ? pos.right : undefined,
                      width: pos.width,
                      justifyContent: pos.justify,
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
                        {isDone ? `${n.secs}s` : isActive ? `working · ${clock(tick % 60)}` : "queued"}
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
            <div className="fill h-full bg-accent" style={{ width: `${Math.round((stage / NODES.length) * 100)}%` }} />
          </div>
          <span className="font-mono text-[11.5px] text-neutral-500">
            {stage} of 11 filled · {clock(elapsed)}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-surface) 26%, transparent)" }}>
        <div className="flex items-center gap-2.5 border-b border-neutral-800 px-5 pb-3.5 pt-4.5">
          <TerminalWindow size={15} className="text-accent" />
          <span className="flex-1 font-mono text-[11.5px] uppercase tracking-wide text-neutral-400">Run log</span>
          <span className="font-mono text-[11px] text-neutral-600">{done ? "finished" : running ? "live" : "paused"}</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden px-5 py-4 font-mono text-[11.5px] leading-[21px]">
          {visibleLog.map((l, i) => (
            <p key={i} className="m-0 text-neutral-600" style={{ animation: "logIn .4s ease both" }}>
              {l.t} <span style={{ color: l.color }}>{l.msg}</span>
            </p>
          ))}
          {running && !done && (
            <p className="m-0 text-accent-300">
              {active ? `  ${active.title} working…` : ""}
              <span className="ml-1 inline-block h-3 w-1.5 align-[-1px] bg-accent" style={{ animation: "caret 1.1s step-end infinite" }} />
            </p>
          )}
        </div>

        {done && (
          <div className="border-t border-accent-800 px-5 py-3.5" style={{ background: "color-mix(in srgb, var(--color-accent-900) 55%, transparent)", animation: "fadeIn .6s ease both" }}>
            <p className="mb-2.5 flex items-center gap-2 text-[13px] leading-5 text-neutral-200">
              <CheckCircle size={16} className="text-accent" />
              All 11 stages filled — document assembled.
            </p>
            <Link href="/document" className="btn btn-primary btn-block flex items-center justify-center gap-2">
              <FileText size={14} />
              Open design document
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-2.5 border-t border-neutral-800 px-5 py-3.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-300" style={{ animation: "dotPulse 2.2s ease-in-out infinite" }} />
            qwen2.5:3b · local · {Math.min(5, stage)} tool calls
          </div>
          <div className="font-mono text-[11px] text-neutral-600">thread a1f9…c72 · in-memory checkpoint</div>
        </div>
      </div>
    </div>
  );
}
