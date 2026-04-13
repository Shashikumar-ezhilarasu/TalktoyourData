"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const SignedInLandingRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-bg-surface">
      <div className="text-center">
        <p className="text-[10px] mono uppercase tracking-[0.25em] text-text-tertiary font-bold mb-2">
          Preparing Workspace
        </p>
        <h2 className="text-xl text-text-primary">Loading your datasets...</h2>
      </div>
    </main>
  );
};
