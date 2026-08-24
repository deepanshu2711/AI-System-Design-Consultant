"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChatsCircle,
  ListChecks,
  Lightning,
  HardDrives,
  Gauge,
  ChartLineUp,
  CheckCircle,
  Play,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import AppNav from "@/components/AppNav";

type Question = {
  num: string;
  text: string;
  placeholder: string;
  icon: typeof Lightning;
  feeds: string;
  seed: string;
};

const QS: Question[] = [
  {
    num: "01",
    text: "Is the feed ranked or reverse-chronological?",
    placeholder: "Type your answer…",
    icon: Lightning,
    feeds: "feeds Cache Expert's key patterns",
    seed: "Ranked — engagement-weighted, with a recency floor.",
  },
  {
    num: "02",
    text: "Do posts include video, or images only?",
    placeholder: "Type your answer…",
    icon: HardDrives,
    feeds: "decides whether CDN and Storage run at all",
    seed: "Images and short video, up to 60s.",
  },
  {
    num: "03",
    text: "Single region at launch, or multi-region?",
    placeholder: "Type your answer…",
    icon: Gauge,
    feeds: "sets replication in Capacity Planner",
    seed: "",
  },
  {
    num: "04",
    text: "Expected DAU at launch, and in a year?",
    placeholder: "Type your answer…",
    icon: ChartLineUp,
    feeds: "every number Traffic Estimator produces",
    seed: "",
  },
];

export default function ClarifyScreen() {
  const [answers, setAnswers] = useState<string[]>(QS.map((q) => q.seed));
  const [focus, setFocus] = useState(1);
  const [resuming, setResuming] = useState(false);
  const [resumed, setResumed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const resume = () => {
    if (resuming) return;
    setResuming(true);
    setResumed(false);
    timerRef.current = setTimeout(() => {
      setResuming(false);
      setResumed(true);
    }, 1500);
  };

  const filled = answers.filter((a) => a.trim()).length;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[44%] top-[-320px] h-[600px] w-[1000px] -translate-x-1/2 blur-[52px]"
        style={{
          background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-accent-800) 38%, transparent), transparent)",
          animation: "auroraA 20s ease-in-out infinite",
        }}
      />

      <div className="relative z-10">
        <AppNav
          crumb="Instagram-like feed"
          right={
            <>
              <span className="tag tag-outline inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  style={{ animation: "dotPulse 1.8s ease-in-out infinite" }}
                />
                {resumed ? "running" : "paused · waiting for input"}
              </span>
              <span className="font-mono text-[11.5px] text-neutral-500">a1f9…c72</span>
            </>
          }
        />
      </div>

      <div
        className="rv relative z-10 flex items-end gap-7.5 border-b border-neutral-800 px-7.5 pb-4.5 pt-6"
        style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 34%, transparent), transparent)" }}
      >
        <div className="flex-1">
          <span className="mb-2.5 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wide text-accent">
            <ChatsCircle size={14} />
            Clarifying Questions · round 1 of up to 2
          </span>
          <h1 className="mb-1.5 text-[27px] font-medium leading-[35px] tracking-[-0.012em]">Four things before the chain starts</h1>
          <p className="m-0 max-w-[74ch] text-[14px] leading-6 text-neutral-400">
            Answer what you know, in your own words. Anything left blank is assumed by the agents and written into the
            document as an explicit assumption — never hidden.
          </p>
        </div>
        <div className="hidden w-75 flex-none border-l border-neutral-800 pl-6 md:block">
          <p className="mb-2 font-mono text-[10.5px] uppercase tracking-wide text-neutral-500">Your brief</p>
          <p className="m-0 text-[13.5px] leading-[22px] text-neutral-200">
            Design a system like Instagram — photo and short-video feed, uploads, follows, notifications.
          </p>
        </div>
      </div>

      <div className="stagger relative z-10 grid flex-1 grid-cols-1 content-start gap-4 px-7.5 py-5.5 md:grid-cols-2">
        {QS.map((q, i) => {
          const value = answers[i];
          const has = !!value.trim();
          const active = focus === i;
          return (
            <div
              key={q.num}
              className="qcard rounded-lg px-4.5 py-4"
              style={{
                border: `1px solid ${active ? "var(--color-accent-700)" : "var(--color-neutral-800)"}`,
                background: has || active ? "color-mix(in srgb, var(--color-surface) 62%, transparent)" : "transparent",
                boxShadow: active ? "0 0 0 3px color-mix(in srgb, var(--color-accent-900) 50%, transparent)" : "none",
              }}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="font-mono text-[11px]"
                  style={{ color: has || active ? "var(--color-accent-300)" : "var(--color-neutral-500)" }}
                >
                  {q.num}
                </span>
                <p className="m-0 flex-1 text-[14.5px] leading-[22px]">{q.text}</p>
                {has && !active && (
                  <CheckCircle weight="fill" size={17} className="text-accent" style={{ animation: "popIn .35s cubic-bezier(.16,.84,.3,1) both" }} />
                )}
                {!has && !active && <span className="text-[11.5px] text-neutral-600">will be assumed</span>}
              </div>
              <div className="border-t border-neutral-800 pt-3">
                <textarea
                  rows={2}
                  aria-label={q.text}
                  placeholder={q.placeholder}
                  value={value}
                  onChange={(e) => {
                    const next = answers.slice();
                    next[i] = e.target.value;
                    setAnswers(next);
                    setFocus(i);
                    setResumed(false);
                  }}
                  onFocus={() => setFocus(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      resume();
                    }
                  }}
                  className="bare-textarea text-[14.5px] leading-6"
                />
              </div>
              <p className="m-0 mt-2.5 flex items-center gap-1.5 text-[11.5px] leading-[18px] text-neutral-600">
                <q.icon size={12} />
                {q.feeds}
              </p>
            </div>
          );
        })}
      </div>

      {resuming && (
        <div
          className="relative z-10"
          style={{
            height: 2,
            backgroundImage: "linear-gradient(90deg, var(--color-accent) 0 12px, transparent 12px 32px)",
            backgroundSize: "32px 2px",
            animation: "barSlide .7s linear infinite",
          }}
        />
      )}

      {resumed && (
        <div
          className="fi relative z-10 flex items-center gap-3 border-t border-accent-800 px-7.5 py-3.5"
          style={{ background: "color-mix(in srgb, var(--color-accent-900) 55%, transparent)" }}
        >
          <ListChecks size={17} className="text-accent" />
          <span className="text-[13.5px] text-neutral-200">Run resumed — Requirement Analyzer is working on RequirementSpec.</span>
          <Link href="/run" className="btn btn-primary ml-auto flex items-center gap-2">
            Watch the run
            <ArrowRight size={14} />
          </Link>
          <span className="font-mono text-[11px] text-neutral-400">answers: {filled} of 4</span>
        </div>
      )}

      <div
        className="relative z-10 flex items-center gap-4.5 border-t border-neutral-800 px-7.5 py-4"
        style={{ background: "color-mix(in srgb, var(--color-surface) 34%, transparent)" }}
      >
        <div className="flex flex-none gap-1.5">
          {answers.map((a, i) => (
            <span
              key={i}
              className="bar h-1 w-8.5 rounded-full"
              style={{ background: a.trim() ? "var(--color-accent)" : "var(--color-neutral-800)" }}
            />
          ))}
        </div>
        <span className="text-[12.5px] text-neutral-400">
          {filled === 4 ? "All four answered — nothing will be assumed" : `${filled} of 4 answered — the other ${4 - filled} will be assumed`}
        </span>
        <span className="ml-auto flex items-center gap-3">
          <span className="font-mono text-[11.5px] text-neutral-600">POST /design/resume · ⌘↵</span>
          <button type="button" className="btn btn-ghost" onClick={() => { setAnswers(QS.map(() => "")); setResumed(false); setFocus(-1); }}>
            Clear answers
          </button>
          <button type="button" className="btn btn-primary flex items-center gap-2" onClick={resume}>
            <Play size={14} />
            {resuming ? "Resuming…" : "Resume run"}
          </button>
        </span>
      </div>
    </div>
  );
}
