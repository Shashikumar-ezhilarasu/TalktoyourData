"use client";
import React from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * A shim for Clerk's <Show> component to handle signed-in/signed-out states
 * using the useAuth hook (server-safe when dynamically rendered).
 */
export const Show = ({ when, children }: { when: "signed-in" | "signed-out", children: React.ReactNode }) => {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) return null;

  if (when === "signed-in" && userId) {
    return <>{children}</>;
  }
  if (when === "signed-out" && !userId) {
    return <>{children}</>;
  }
  return null;
};
