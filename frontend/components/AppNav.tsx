"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompassTool, GearSix } from "@phosphor-icons/react/dist/ssr";

const LINKS = [
  { href: "/prompt", label: "New design" },
  { href: "/run", label: "Runs" },
  { href: "/document", label: "Documents" },
];

export default function AppNav({
  crumb,
  right,
}: {
  crumb?: string;
  right?: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="nav relative z-10 border-b border-neutral-800 px-7 bg-transparent">
      <span className="nav-brand flex items-center gap-2.5">
        <CompassTool weight="fill" size={18} className="text-accent" />
        Consultant
      </span>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
      {crumb && <span className="text-[13px] text-neutral-500">/ {crumb}</span>}
      <span className="ml-auto flex items-center gap-3">
        {right}
        <span className="btn btn-icon w-8 h-8 grid place-items-center">
          <GearSix size={16} />
        </span>
      </span>
    </div>
  );
}
