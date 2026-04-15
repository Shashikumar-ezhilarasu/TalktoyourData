"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Show } from "@/components/ClerkShow";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export const AppFrame = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && (
        <header className="fixed top-0 left-0 right-0 z-[100] border-b border-bg-border bg-bg-base/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-accent-main rounded-sm rotate-45" />
            </div>
            <span className="mono text-xs uppercase font-bold tracking-[0.3em]">
              DataLens // Beta
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Show when="signed-out">
              <div className="flex gap-4">
                <SignInButton mode="modal">
                  <button className="mono text-[10px] uppercase font-bold tracking-widest px-4 py-2 border border-bg-border rounded hover:bg-bg-elevated transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="mono text-[10px] uppercase font-bold tracking-widest px-4 py-2 bg-accent-main text-white rounded hover:opacity-90 transition-opacity">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <a
                  href="/profile"
                  className="flex items-center gap-2 text-[10px] mono uppercase font-bold tracking-widest px-3 py-1.5 border border-bg-border rounded text-text-tertiary hover:bg-bg-elevated hover:border-accent-main hover:text-text-primary transition-colors"
                >
                  Data Profile
                </a>
                <UserButton />
              </div>
            </Show>
          </div>
        </header>
      )}
      <main className={isDashboard ? "min-h-screen" : "pt-16 min-h-screen"}>
        {children}
      </main>
    </>
  );
};
