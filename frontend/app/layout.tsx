import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkTokenSync } from "@/components/ClerkTokenSync";
import { AppFrame } from "@/components/layout/AppFrame";

import "./globals.css";

export const metadata: Metadata = {
  title: "DataLens — Ask your data anything.",
  description: "AI-driven analytics with a refined terminal aesthetic.",
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
          <AppFrame>{children}</AppFrame>
        </body>
      </html>
    </ClerkProvider>
  );
}
