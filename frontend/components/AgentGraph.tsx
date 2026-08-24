"use client";

import { useEffect, useRef } from "react";
import { CompassTool } from "@phosphor-icons/react/dist/ssr";
import { AGENTS } from "@/lib/agents";

const LEFT = AGENTS.slice(0, 4);
const RIGHT = AGENTS.slice(4, 8);
const media = AGENTS.find((a) => a.mediaOnly === true);
const closing = AGENTS.find((a) => a.closesRun === true);

const LEFT_TOPS = [124, 228, 352, 456];
const RIGHT_TOPS = [124, 228, 352, 456];

export default function AgentGraph() {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      const box = boxRef.current;
      const inner = innerRef.current;
      if (!box || !inner) return;
      const s = Math.min(1, box.clientWidth / 1120);
      inner.style.transform = `scale(${s})`;
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

  const edgePaths = [
    ...LEFT_TOPS.map((t) => `M560 280 L242 ${t}`),
    ...RIGHT_TOPS.map((t) => `M560 280 L878 ${t}`),
    "M560 280 L560 96",
    "M560 280 L560 464",
  ];

  return (
    <div
      ref={boxRef}
      className="mx-auto w-full max-w-[1120px] overflow-hidden"
      style={{ background: "#161826", aspectRatio: "1120 / 560" }}
    >
      <div
        ref={innerRef}
        className="relative overflow-hidden rounded-[14px] border border-neutral-800 shadow-[0_30px_80px_rgba(0,0,0,.55)]"
        style={{
          transformOrigin: "top left",
          width: 1120,
          height: 560,
          backgroundColor: "color-mix(in srgb, var(--color-surface) 32%, transparent)",
          backgroundImage:
            "radial-gradient(circle at center, var(--color-neutral-800) 1px, transparent 1px), radial-gradient(520px 340px at 50% 50%, color-mix(in srgb, var(--color-accent-900) 70%, transparent), transparent 70%)",
          backgroundSize: "28px 28px, auto",
        }}
      >
        <svg viewBox="0 0 1120 560" width={1120} height={560} className="absolute inset-0" aria-hidden>
          <defs>
            <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#423a6a" />
              <stop offset="0.5" stopColor="#9184d9" />
              <stop offset="1" stopColor="#423a6a" />
            </linearGradient>
          </defs>
          <g stroke="#3f424d" strokeWidth={1} fill="none">
            {edgePaths.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g stroke="url(#edge)" strokeWidth={1.2} fill="none" strokeDasharray="4 12" style={{ animation: "dashFlow 11s linear infinite" }}>
            {edgePaths.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <circle
            cx={560}
            cy={280}
            r={122}
            fill="none"
            stroke="#5d5294"
            strokeWidth={1}
            style={{ transformOrigin: "560px 280px", animation: "ringPulse 4.4s ease-in-out infinite" }}
          />
          <circle cx={560} cy={280} r={92} fill="#221f36" stroke="#9184d9" strokeWidth={1.4} />
          <circle
            cx={560}
            cy={280}
            r={92}
            fill="none"
            stroke="#9184d9"
            strokeWidth={1}
            strokeDasharray="2 10"
            style={{ transformOrigin: "560px 280px", animation: "spinSlow 26s linear infinite" }}
          />
        </svg>

        <div className="absolute w-41 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: 560, top: 280 }}>
          <CompassTool weight="fill" size={24} className="mx-auto text-accent" />
          <p className="m-0 mb-1 mt-2 text-[16px] font-medium leading-[22px]">Supervisor</p>
          <p className="m-0 mb-1.5 font-mono text-[10.5px] text-neutral-500">the sole router</p>
          <p className="mx-auto m-0 max-w-35 text-[11.5px] leading-[17px] text-neutral-400">
            routes to the first empty field of DesignState
          </p>
        </div>

        {LEFT.map((a, i) => (
          <GraphNode key={a.num} agent={a} style={{ left: 32, top: LEFT_TOPS[i] - 32, width: 210 }} />
        ))}
        {RIGHT.map((a, i) => (
          <GraphNode key={a.num} agent={a} style={{ right: 32, top: RIGHT_TOPS[i] - 32, width: 210 }} />
        ))}

        {media && (
          <div
            className="node absolute box-border flex h-16 items-center justify-center gap-2.5 rounded-lg border border-dashed border-neutral-700 px-3.5 shadow-[0_10px_26px_rgba(0,0,0,.5)]"
            style={{ left: 410, top: 32, width: 300, background: "var(--color-surface)" }}
          >
            <span
              className="ic grid h-7.5 w-7.5 flex-none place-items-center rounded-md text-accent-300"
              style={{ background: "color-mix(in srgb, var(--color-accent-900) 70%, transparent)" }}
            >
              <media.icon size={16} />
            </span>
            <span>
              <span className="block text-[13.5px] leading-[18px]">CDN Expert &amp; Storage Expert</span>
              <span className="block font-mono text-[10px] text-neutral-500">only when the design involves media</span>
            </span>
          </div>
        )}

        {closing && (
          <div
            className="node absolute box-border flex h-16 items-center justify-center gap-2.5 rounded-lg border px-3.5 shadow-[0_12px_30px_rgba(0,0,0,.55)]"
            style={{
              left: 410,
              top: 464,
              width: 300,
              borderColor: "var(--color-accent-700)",
              background: "color-mix(in srgb, var(--color-accent-900) 82%, var(--color-surface))",
            }}
          >
            <span
              className="ic grid h-7.5 w-7.5 flex-none place-items-center rounded-md text-accent-200"
              style={{ background: "color-mix(in srgb, var(--color-accent-800) 80%, transparent)" }}
            >
              <closing.icon size={16} />
            </span>
            <span>
              <span className="block text-[13.5px] leading-[18px]">
                {closing.title} <span className="text-accent-300">→ END</span>
              </span>
              <span className="block font-mono text-[10px] text-neutral-500">{closing.schema}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function GraphNode({
  agent,
  style,
}: {
  agent: (typeof AGENTS)[number];
  style: React.CSSProperties;
}) {
  const Icon = agent.icon;
  return (
    <div
      className="node absolute box-border flex h-16 items-center gap-2.5 rounded-lg border border-neutral-700 px-3.5 py-2.5 shadow-[0_10px_26px_rgba(0,0,0,.5)]"
      style={{ ...style, background: "var(--color-surface)" }}
    >
      <span
        className="ic grid h-7.5 w-7.5 flex-none place-items-center rounded-md text-accent-300"
        style={{ background: "color-mix(in srgb, var(--color-accent-900) 70%, transparent)" }}
      >
        <Icon size={16} />
      </span>
      <span>
        <span className="block text-[13.5px] leading-[18px]">{agent.title}</span>
        <span className="block font-mono text-[10px] text-neutral-500">{agent.schema}</span>
      </span>
    </div>
  );
}
