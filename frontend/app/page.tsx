import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { DatasetUploader } from "@/components/landing/DatasetUploader";
import { Show } from "@/components/ClerkShow";
import { SignedInLandingRedirect } from "@/components/dashboard/SignedInLandingRedirect";

export default function LandingPage() {
  return (
    <>
      <Show when="signed-out">
        <main className="grid grid-cols-1 lg:grid-cols-[1fr_480px] h-[calc(100vh-64px)] overflow-hidden">
          <section className="relative overflow-hidden border-r border-bg-border">
            {/* Decorative corner accent */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-accent-dim/30 pointer-events-none" />
            <HeroSection />
          </section>

          <section className="bg-bg-elevated/30 flex flex-col items-center justify-center relative">
            <DatasetUploader />

            <footer className="absolute bottom-8 text-[10px] mono text-tertiary uppercase flex gap-6">
              <span>Security: PII Scrubbing Active</span>
              <span>·</span>
              <span>Standard Bank Cloud Certified</span>
            </footer>
          </section>
        </main>
      </Show>
      <Show when="signed-in">
        <SignedInLandingRedirect />
      </Show>
    </>
  );
}
