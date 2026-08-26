"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChatsCircle,
  ListChecks,
  ChartLineUp,
  Gauge,
  Database,
  Lightning,
  FlowArrow,
  PlugsConnected,
  GlobeHemisphereWest,
  HardDrives,
  TreeStructure,
  Play,
  HandWaving,
  Plugs,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { startDesign } from "@/lib/api";
import { saveRunSession } from "@/lib/session";

const GHOSTS = [
  "Design a system like Instagram — feed, uploads, follows",
  "Design a ride-hailing dispatch system",
  "Design a URL shortener that survives 50k rps",
  "Design chat at WhatsApp scale",
];

const EXAMPLES = [
  "A ride-hailing dispatch system",
  "WhatsApp-scale chat",
  "A URL shortener",
  "Video streaming with transcoding",
];

const CHAIN = [
  { icon: ChatsCircle, label: "Clarifying Questions" },
  { icon: ListChecks, label: "Requirement Analyzer" },
  { icon: ChartLineUp, label: "Traffic Estimator" },
  { icon: Gauge, label: "Capacity Planner" },
  { icon: Database, label: "Database Designer" },
  { icon: Lightning, label: "Cache Expert" },
  { icon: FlowArrow, label: "Queue Expert" },
  { icon: PlugsConnected, label: "API Designer" },
  { icon: GlobeHemisphereWest, label: "CDN Expert" },
  { icon: HardDrives, label: "Storage Expert" },
  { icon: TreeStructure, label: "Microservice Expert → END", final: true },
];

export default function PromptScreen() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [ghost, setGhost] = useState("");
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let gi = 0;
    let gc = 0;
    const type = () => {
      const full = GHOSTS[gi % GHOSTS.length];
      if (gc <= full.length) {
        setGhost(full.slice(0, gc));
        gc += 1;
        timerRef.current = setTimeout(type, 42);
      } else {
        timerRef.current = setTimeout(() => {
          gi += 1;
          gc = 0;
          type();
        }, 2200);
      }
    };
    type();
    return () => clearTimeout(timerRef.current);
  }, []);

  const start = () => {
    if (!value.trim() || running) return;
    setRunning(true);
    const threadId = crypto.randomUUID();
    const userQuery = value.trim();
    saveRunSession({ threadId, userQuery });
    // Fired but not awaited: navigating to /run right away is what lets the
    // user watch the run's real progress live via its SSE stream, instead of
    // staring at a static button for however long the first stage takes.
    // /run itself handles routing on to /clarify if the run pauses for
    // another round of questions, or showing the error if it fails.
    startDesign(userQuery, threadId).catch((err) => {
      console.error("design run failed to start", err);
    });
    router.push("/run");
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length + " words" : "";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[620px] w-[1100px] -translate-x-1/2 blur-[46px]"
        style={{
          background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-accent-800) 46%, transparent), transparent)",
          animation: "aurora 18s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-220px] right-[-180px] h-[560px] w-[760px] blur-[60px]"
        style={{
          background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-section-glow) 30%, transparent), transparent)",
          animation: "auroraB 24s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(circle at center, var(--color-neutral-900) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(900px 560px at 50% 22%, black, transparent 78%)",
        }}
      />

      <div className="relative z-10">
        <AppNav
          right={
            <span className="flex items-center gap-2 font-mono text-[11.5px] text-neutral-400">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#7fd1a8", boxShadow: "0 0 10px #7fd1a8", animation: "dotPulse 2.2s ease-in-out infinite" }}
              />
              ollama · qwen2.5:3b
            </span>
          }
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10 py-14">
        <p className="fi mb-3.5 flex items-center gap-2.5 font-mono text-[11.5px] uppercase tracking-wide text-accent">
          <span className="h-px w-6.5 bg-accent" />
          New design run
        </p>
        <h1 className="rv mb-3 text-center text-[46px] font-medium leading-[54px] tracking-[-0.02em]" style={{ "--d": ".06s" } as React.CSSProperties}>
          What are we designing?
        </h1>
        <p className="rv mb-8 max-w-[58ch] text-center text-[15.5px] leading-[26px] text-neutral-400" style={{ "--d": ".14s" } as React.CSSProperties}>
          One sentence is enough — Clarifying Questions will ask for whatever it needs before the chain starts.
        </p>

        <div
          className="rv composer sheen w-full max-w-[860px] rounded-xl border border-neutral-700 shadow-[0_22px_54px_rgba(0,0,0,.5)]"
          style={{ "--d": ".22s", background: "color-mix(in srgb, var(--color-surface) 78%, transparent)" } as React.CSSProperties}
        >
          <div className="px-6 pb-3 pt-5.5">
            <textarea
              rows={3}
              placeholder={ghost}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  start();
                }
              }}
              aria-label="System to design"
              className="bare-textarea text-[18px] leading-[29px]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5 border-t border-neutral-800 px-4 pb-3.5 pt-3">
            <span className="flex w-full items-center gap-3.5">
              <span className="text-xs text-neutral-500">Plain text — the agents ask for the rest</span>
              <span className="ml-auto flex items-center gap-3.5">
                <span className="font-mono text-[11px] text-neutral-600">{wordCount}</span>
                <span className="font-mono text-[11px] text-neutral-600">⌘↵</span>
                <button
                  type="button"
                  onClick={start}
                  disabled={!value.trim()}
                  className="btn btn-primary flex items-center gap-2"
                  style={{ opacity: value.trim() ? 1 : 0.5 }}
                >
                  <Play size={14} />
                  {running ? "Starting…" : "Start the run"}
                </button>
              </span>
            </span>
          </div>
          {running && (
            <div
              style={{
                height: 2,
                backgroundImage: "linear-gradient(90deg, var(--color-accent) 0 12px, transparent 12px 32px)",
                backgroundSize: "32px 2px",
                animation: "barSlide .7s linear infinite",
              }}
            />
          )}
        </div>

        <div className="rv mt-6 flex max-w-[860px] flex-wrap items-center justify-center gap-2.5" style={{ "--d": ".3s" } as React.CSSProperties}>
          <span className="text-[12.5px] text-neutral-500">Try:</span>
          {EXAMPLES.map((label) => (
            <span
              key={label}
              className="ex rounded-md border border-neutral-800 px-2.5 py-1.5 text-[12.5px] text-neutral-300"
              onClick={() => {
                setValue("Design " + label.replace(/^A /, "a ").replace(/^An /, "an "));
              }}
            >
              {label}
            </span>
          ))}
        </div>

      </div>

      <div className="tickwrap relative z-10 overflow-hidden border-t border-neutral-800" style={{ background: "color-mix(in srgb, var(--color-surface) 34%, transparent)" }}>
        <div className="flex items-center gap-0 px-7">
          <span className="mr-5.5 flex-none border-r border-neutral-800 py-3.5 pr-5.5 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">
            The chain <span className="text-accent-300">11 stages</span>
          </span>
          <div className="flex-1 overflow-hidden py-3.5">
            <div className="tick">
              {[0, 1].map((rep) => (
                <span key={rep} className="flex gap-8.5" aria-hidden={rep === 1}>
                  {CHAIN.map((c) => (
                    <span key={c.label} className="inline-flex items-center gap-2 whitespace-nowrap text-[12.5px] text-neutral-400">
                      <c.icon size={14} className={c.final ? "text-accent" : "text-accent-300"} />
                      {c.label}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-6.5 border-t border-neutral-800 px-7 py-3.5 text-[12.5px] text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <HandWaving size={15} className="text-accent-300" />
          Pauses once for clarifications
        </span>
        <span className="inline-flex items-center gap-2">
          <Plugs size={15} className="text-accent-300" />
          Nothing leaves this machine
        </span>
        <span className="inline-flex items-center gap-2">
          <WarningCircle size={15} className="text-accent-300" />
          Checkpoints are in-memory
        </span>
        <span className="ml-auto font-mono">POST /design/start</span>
      </div>
    </div>
  );
}
