"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/types";

export function Avatar({ profile, size = 56 }: { profile: Profile; size?: number }) {
  // Generated avatars — no real photos in the demo cohort, privacy-first by default.
  const initial = profile.displayAlias.slice(0, 1);
  return (
    <div
      className="flex items-center justify-center rounded-full font-display shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `radial-gradient(circle at 30% 30%, hsl(${profile.avatarHue} 45% 38%), hsl(${profile.avatarHue} 50% 18%))`,
        color: "#F2EFE8",
        border: "1px solid rgba(201,167,91,0.35)",
      }}
    >
      {initial}
    </div>
  );
}

export function VerifiedBadge({ status }: { status: Profile["verificationStatus"] }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gold border border-gold/40 rounded-full px-2 py-0.5">
        ✓ מאומת
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ink-muted border border-night-line rounded-full px-2 py-0.5">
        אימות בתהליך
      </span>
    );
  return null;
}

export function SideTag({ side }: { side: Profile["side"] }) {
  return (
    <span
      className="text-xs rounded-full px-2 py-0.5 border"
      style={{
        color: side === "provider" ? "#6B8CAE" : "#D98A9E",
        borderColor: side === "provider" ? "#6B8CAE55" : "#D98A9E55",
      }}
    >
      {side === "provider" ? "Provider" : "Growth"}
    </span>
  );
}

const NAV = [
  { href: "/app/discover", label: "גילוי", icon: "✦" },
  { href: "/app/matches", label: "התאמות", icon: "♡" },
  { href: "/app/companion", label: "מלווה", icon: "◈" },
  { href: "/app/wallet", label: "ארנק", icon: "▣" },
  { href: "/app/profile", label: "פרופיל", icon: "◉" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-night-surface/95 backdrop-blur border-t border-night-line">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition ${
                active ? "text-gold" : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar({ title, back }: { title: string; back?: string }) {
  return (
    <header className="sticky top-0 z-30 bg-night/90 backdrop-blur border-b border-night-line">
      <div className="max-w-md mx-auto flex items-center gap-3 px-4 h-14">
        {back && (
          <Link href={back} className="text-ink-muted hover:text-gold text-xl leading-none">
            →
          </Link>
        )}
        <h1 className="font-display text-lg text-gold-soft">{title}</h1>
      </div>
    </header>
  );
}
