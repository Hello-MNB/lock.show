"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { me } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!me) router.replace("/onboarding");
  }, [me, router]);

  if (!me) return null;

  return (
    <div className="min-h-dvh pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
