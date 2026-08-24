import type { Agent } from "@/lib/agents";

export default function RosterCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  return (
    <div
      className="node flex flex-col gap-3.5 rounded-lg border border-neutral-800 px-5.5 pb-5 pt-5.5"
      style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 55%, transparent), transparent)" }}
    >
      <div className="flex items-center gap-3">
        <span
          className="ic grid h-8.5 w-8.5 flex-none place-items-center rounded-lg text-accent-300"
          style={{ background: "color-mix(in srgb, var(--color-accent-900) 70%, transparent)" }}
        >
          <Icon size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] leading-[22px]">{agent.title}</span>
          <span className="block truncate font-mono text-[10.5px] leading-[15px] text-neutral-500">{agent.file}</span>
        </span>
        <span className="flex-none font-mono text-[11px] tabular-nums text-neutral-600">{agent.num}</span>
      </div>
      <p className="m-0 flex-1 text-[14px] leading-[23px] text-neutral-300">{agent.blurb}</p>
      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-800 pt-0.5">
        <span className="tag tag-outline mt-3 font-mono text-[10.5px]">{agent.schema}</span>
        {agent.mediaOnly && <span className="tag tag-neutral mt-3 text-[10.5px]">media only</span>}
        {agent.closesRun && <span className="tag tag-neutral mt-3 text-[10.5px]">closes the run</span>}
      </div>
    </div>
  );
}
