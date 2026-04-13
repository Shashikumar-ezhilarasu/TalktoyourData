import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Show } from "@/components/ClerkShow";
import { ClerkTokenSync } from "@/components/ClerkTokenSync";

import './globals.css';

export const metadata: Metadata = {
  title: 'DataLens — Ask your data anything.',
  description: 'AI-driven analytics with a refined terminal aesthetic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ClerkTokenSync />
      <html lang="en">
        <body className="dot-grid min-h-screen bg-bg-base text-text-primary">
          <header className="fixed top-0 left-0 right-0 z-[100] border-b border-bg-border bg-bg-base/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                 <div className="w-4 h-4 bg-accent-main rounded-sm rotate-45" />
               </div>
               <span className="mono text-xs uppercase font-bold tracking-[0.3em] font-bold">DataLens // Beta</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Show when="signed-out">
                <div className="flex gap-4">
                  <SignInButton mode="modal">
                    <button className="mono text-[10px] uppercase font-bold tracking-widest px-4 py-2 border border-bg-border rounded hover:bg-bg-elevated transition-colors">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="mono text-[10px] uppercase font-bold tracking-widest px-4 py-2 bg-accent-main text-white rounded hover:opacity-90 transition-opacity">Sign Up</button>
                  </SignUpButton>
                </div>
              </Show>
              <Show when="signed-in">
                <div className="flex items-center gap-4">
                  <a href="/profile" className="flex items-center gap-2 text-[10px] mono uppercase font-bold tracking-widest px-3 py-1.5 border border-bg-border rounded text-text-tertiary hover:bg-bg-elevated hover:border-accent-main hover:text-text-primary transition-colors">
                    Data Profile
                  </a>
                  <UserButton />
                </div>
              </Show>
            </div>
          </header>
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
