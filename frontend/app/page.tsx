import Link from "next/link";
import {
  CompassTool,
  Star,
  TerminalWindow,
  GitBranch,
  Copy,
  Key,
  BracketsCurly,
  HandWaving,
  Scales,
  WifiSlash,
  ShieldCheck,
  Calculator,
  Plugs,
  GitPullRequest,
  ArrowElbowDownRight,
  ChatsCircle,
} from "@phosphor-icons/react/dist/ssr";
import { AGENTS } from "@/lib/agents";
import AgentGraph from "@/components/AgentGraph";
import RosterCard from "@/components/RosterCard";

const STATS = [
  { value: "11", label: "Specialists on the bench" },
  { value: "13", label: "Typed artifact schemas" },
  { value: "0", label: "API keys to provision" },
  { value: "1", label: "Local model, shared" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Typed by force, not by hope",
    body: "Every agent commits to a Pydantic model, and the models argue back — a traffic estimate whose DAU exceeds its MAU fails loudly instead of landing in the document.",
  },
  {
    icon: HandWaving,
    title: "It asks before it assumes",
    body: "The graph interrupts with the Clarifying Questions agent's list, hands back a thread id, and resumes on your answers — human in the loop, by design.",
  },
  {
    icon: Calculator,
    title: "The numbers are computed",
    body: "A sandboxed calculator and a JSON formatter are bound into a capped tool-calling loop, so capacity figures are worked out rather than guessed at.",
  },
  {
    icon: Plugs,
    title: "Nothing leaves the machine",
    body: "One local Ollama model behind all eleven agents through langchain-ollama. No key to provision, nothing metered, nothing shipped to a vendor.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(900px 620px at 50% -140px, color-mix(in srgb, var(--color-accent-900) 88%, transparent), transparent 62%), radial-gradient(1100px 800px at -6% 108%, color-mix(in srgb, black 34%, transparent), transparent 55%), var(--color-bg)",
      }}
    >
      <nav
        className="nav sticky top-0 z-20 backdrop-blur-md px-10"
        style={{
          paddingInline: "max(40px, calc((100% - 1200px) / 2))",
          background: "color-mix(in srgb, var(--color-bg) 82%, transparent)",
        }}
      >
        <span className="nav-brand flex items-center gap-2.5">
          <CompassTool weight="fill" size={19} className="text-accent" />
          Consultant
        </span>
        <a href="#roster">The bench</a>
        <Link href="/prompt">Try the prototype</Link>
        <a href="#install">Install</a>
        <button type="button" className="btn btn-primary flex items-center gap-1.5">
          <Star size={15} />
          Star on GitHub
        </button>
      </nav>

      <div className="max-w-[1200px] mx-auto px-10">
        {/* Hero */}
        <section className="relative pt-26 pb-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-11 h-50 w-130 -translate-x-1/2 blur-[28px]"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in srgb, var(--color-accent-700) 34%, transparent), transparent)",
            }}
          />
          <span className="fi relative inline-flex items-center gap-2.5 rounded-full border border-accent-800 py-1.5 pl-3.5 pr-2 font-mono text-[11.5px] tracking-wide text-accent-200 shadow-[0_8px_24px_rgba(0,0,0,.45)]"
            style={{ background: "color-mix(in srgb, var(--color-accent-900) 62%, transparent)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" style={{ animation: "dotPulse 2s ease-in-out infinite" }} />
            supervisor + 11 workers
            <span className="h-3.5 w-px bg-accent-800" />
            <span className="text-neutral-400">LangGraph</span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-neutral-300"
              style={{ background: "color-mix(in srgb, var(--color-accent-800) 55%, transparent)" }}
            >
              <WifiSlash size={12} />
              runs offline
            </span>
          </span>

          <h1 className="rv relative mx-auto mt-7.5 max-w-[17ch] text-[78px] font-medium leading-[84px] tracking-[-0.024em]" style={{ "--d": ".08s" } as React.CSSProperties}>
            <span className="block">A design review,</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(96deg, var(--color-text) 18%, var(--color-accent-300) 78%)" }}
            >
              run as a graph.
            </span>
          </h1>
          <p className="rv mx-auto mt-7 max-w-[54ch] text-[19px] leading-[31px] text-neutral-200" style={{ "--d": ".18s" } as React.CSSProperties}>
            One supervisor, eleven specialists, and a shared state that fills with typed artifacts until the document is whole.
          </p>
          <p className="rv mx-auto mt-3 max-w-[52ch] text-[15.5px] leading-[26px] text-neutral-400" style={{ "--d": ".24s" } as React.CSSProperties}>
            Not one giant prompt — a routed graph you can inspect, interrupt and resume, on a model running entirely on your own machine.
          </p>
          <div className="rv mt-8 flex justify-center gap-3" style={{ "--d": ".28s" } as React.CSSProperties}>
            <Link href="/prompt" className="btn btn-primary flex items-center gap-2">
              <TerminalWindow size={15} />
              Clone and run it
            </Link>
            <button type="button" className="btn btn-ghost flex items-center gap-2">
              <GitBranch size={15} />
              Read the architecture
            </button>
          </div>
          <div
            className="rv sheen mt-5.5 inline-flex items-center gap-3 rounded-lg border border-neutral-800 py-2.5 pl-4 pr-2.5 font-mono text-[13px] text-neutral-300"
            style={{ "--d": ".34s", background: "color-mix(in srgb, var(--color-surface) 62%, transparent)" } as React.CSSProperties}
          >
            <span className="text-neutral-500">$</span>curl -X POST :8000/design/start -d {"'"}{"{"}"user_query":"Design Instagram"{"}"}{"'"}
            <span className="btn btn-icon grid h-7.5 w-7.5 place-items-center">
              <Copy size={15} />
            </span>
          </div>
          <div className="stagger mt-8.5 flex flex-wrap justify-center gap-8.5 text-[13.5px] text-neutral-400">
            <span className="inline-flex items-center gap-2">
              <Key size={15} className="text-accent-300" />
              No API keys, ever
            </span>
            <span className="inline-flex items-center gap-2">
              <BracketsCurly size={15} className="text-accent-300" />
              13 typed artifact schemas
            </span>
            <span className="inline-flex items-center gap-2">
              <HandWaving size={15} className="text-accent-300" />
              Pauses to ask, resumes on answer
            </span>
            <span className="inline-flex items-center gap-2">
              <Scales size={15} className="text-accent-300" />
              MIT
            </span>
          </div>
        </section>

        {/* Agent graph */}
        <section className="fi pt-4 pb-21" style={{ "--d": ".36s" } as React.CSSProperties}>
          <AgentGraph />
        </section>
      </div>

      {/* At a glance */}
      <section
        aria-label="At a glance"
        className="py-15"
        style={{
          background:
            "radial-gradient(900px 420px at 84% -40%, color-mix(in srgb, var(--color-section-glow) 70%, transparent), transparent 64%), var(--color-section)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="stagger grid grid-cols-4 justify-between gap-7">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="m-0 text-[46px] font-medium leading-[56px] tracking-[-0.055em] tabular-nums">{s.value}</p>
                <p className="mt-3 text-[13px] uppercase tracking-wide" style={{ color: "rgba(233,233,237,.64)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-10">
        {/* Roster */}
        <section id="roster" className="pt-21 pb-6">
          <span className="block mb-3.5 text-[13px] uppercase tracking-wide text-accent">The bench</span>
          <h2 className="mb-2.5 max-w-[26ch] text-[34px] font-medium leading-[44px] tracking-[-0.014em]">
            Each specialist owns one field, and hands control back
          </h2>
          <p className="mb-9 max-w-[66ch] text-[15.5px] leading-[28px] text-neutral-300">
            No agent calls another. The supervisor reads the shared state, finds what is still missing, and dispatches the
            next specialist — which is why a run is inspectable, resumable, and typed at every hop.
          </p>
          <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AGENTS.map((a) => (
              <RosterCard key={a.num} agent={a} />
            ))}
            <div className="flex flex-col justify-center gap-3 rounded-lg border border-dashed border-neutral-800 p-5.5">
              <span
                className="ic grid h-8.5 w-8.5 place-items-center rounded-lg text-accent"
                style={{ background: "color-mix(in srgb, var(--color-accent-900) 55%, transparent)" }}
              >
                <CompassTool weight="fill" size={17} />
              </span>
              <p className="m-0 text-[14px] leading-[23px] text-neutral-400">
                The supervisor sits between every name on this list — eleven hand-offs, one router, no cross-talk.
              </p>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section id="run" className="pt-18 pb-2">
          <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="lift rounded-lg border border-neutral-800 p-7.5"
                style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 60%, transparent), transparent)" }}
              >
                <span
                  className="ic grid h-9 w-9 place-items-center rounded-lg text-accent-300"
                  style={{ background: "color-mix(in srgb, var(--color-accent-900) 70%, transparent)" }}
                >
                  <f.icon size={18} />
                </span>
                <h3 className="mb-2.5 mt-5 text-[22px] font-medium leading-[30px]">{f.title}</h3>
                <p className="m-0 text-[15px] leading-[26px] text-neutral-300">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Run log preview */}
        <section className="pt-14">
          <div
            className="sheen lift overflow-hidden rounded-lg border border-neutral-800 shadow-[0_22px_54px_rgba(0,0,0,.5)]"
            style={{ background: "color-mix(in srgb, var(--color-surface) 74%, transparent)" }}
          >
            <div className="flex items-center gap-2.5 border-b border-neutral-800 px-5 py-3.5 font-mono text-xs text-neutral-400">
              <TerminalWindow size={14} className="text-accent" />
              POST /design/start
              <span className="ml-auto text-neutral-500">thread a1f9…c72</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b border-neutral-800 px-6 py-5.5 font-mono text-[13px] leading-6 md:border-b-0 md:border-r">
                <div className="text-neutral-400">
                  {"{ "}
                  <span className="text-accent-300">&quot;user_query&quot;</span>:
                </div>
                <div className="pl-3.5 text-neutral-200">&quot;Design a system like Instagram&quot; {"}"}</div>
                <div className="my-4 h-px bg-neutral-800" />
                <div className="text-neutral-500">
                  status → <span className="text-text">waiting_for_input</span>
                </div>
                <div className="text-neutral-500">
                  questions → <span className="text-text">4</span>
                  <span
                    className="ml-1.5 inline-block h-3.5 w-1.5 align-[-2px] bg-accent"
                    style={{ animation: "caret 1.1s step-end infinite" }}
                  />
                </div>
              </div>
              <div className="px-6 py-5.5 text-sm leading-6 text-neutral-300">
                <p className="mb-3 flex items-center gap-2 text-text">
                  <ChatsCircle size={15} className="text-accent-300" /> Clarifying Questions asks
                </p>
                <p className="mb-1.5">— Is this feed ranked or reverse-chronological?</p>
                <p className="mb-1.5">— Do posts include video, or images only?</p>
                <p className="mb-1.5">— Target region: single or multi-region?</p>
                <p className="m-0">— Expected DAU at launch?</p>
              </div>
            </div>
          </div>
        </section>

        {/* Install */}
        <section id="install" className="pt-20">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="mb-3.5 block text-[13px] uppercase tracking-wide text-accent">Run it</span>
              <h2 className="text-[32px] font-medium leading-[42px] tracking-[-0.012em]">Four commands, no keys</h2>
              <p className="mt-5 max-w-[44ch] text-[15.5px] leading-[28px] text-neutral-300">
                Python 3.12+, uv, and a local Ollama daemon with{" "}
                <code className="font-mono text-[14px] text-accent-300">qwen2.5:3b</code> pulled. Checkpointing is
                in-memory for now — state does not survive a restart.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="tag tag-outline">MIT</span>
                <span className="tag tag-accent">LangGraph</span>
                <span className="tag tag-neutral">FastAPI</span>
                <span className="tag tag-neutral">Ollama</span>
              </div>
            </div>
            <div
              className="sheen lift rounded-lg border border-neutral-800 px-6.5 py-6 font-mono text-[13.5px] leading-[27px] shadow-[0_22px_54px_rgba(0,0,0,.5)] lg:col-span-7"
              style={{ background: "color-mix(in srgb, var(--color-surface) 74%, transparent)" }}
            >
              <div className="text-neutral-500">
                $ <span className="text-text">git clone github.com/deepanshu2711/AI-System-Design-Consultant</span>
              </div>
              <div className="text-neutral-500">
                $ <span className="text-text">uv sync</span>
              </div>
              <div className="text-neutral-500">
                $ <span className="text-text">ollama pull qwen2.5:3b</span>
              </div>
              <div className="text-neutral-500">
                $ <span className="text-text">uv run fastapi dev app/main.py</span>
              </div>
              <div className="mt-2.5 text-accent-300">
                <ArrowElbowDownRight size={14} className="mr-1.5 inline align-[-2px]" />
                POST 127.0.0.1:8000/design/start · /design/resume
              </div>
            </div>
          </div>
        </section>

        {/* Footer / contribute */}
        <section className="mt-16 border-t border-divider py-20">
          <div className="flex flex-wrap items-end justify-between gap-12">
            <div>
              <h3 className="text-[28px] font-medium leading-[38px]">Built in the open, and short a few hands</h3>
              <p className="mt-4 max-w-[56ch] text-[15.5px] leading-[28px] text-neutral-300">
                No test suite yet, no lint or CI, the model still hardcoded, and export to Markdown/PDF unwritten. Issues
                tagged <em className="not-italic text-accent-300">good first issue</em> are the place to start.
              </p>
            </div>
            <div className="flex flex-none gap-3">
              <button type="button" className="btn btn-primary flex items-center gap-2">
                <GitPullRequest size={15} />
                Good first issues
              </button>
              <button type="button" className="btn btn-ghost flex items-center gap-2">
                <Star size={15} />
                Star the repo
              </button>
            </div>
          </div>
          <p className="mt-13 text-[13px] leading-[28px] text-neutral-500">
            MIT licensed · deepanshu2711/AI-System-Design-Consultant · Python 3.12+ · LangGraph · Ollama
          </p>
        </section>
      </div>
    </div>
  );
}
