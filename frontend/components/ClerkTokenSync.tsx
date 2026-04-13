"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { auth } from "@/lib/auth";

export const ClerkTokenSync = () => {
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    const sync = async () => {
      if (isAuthLoaded && isUserLoaded && user) {
        const token = await getToken();
        if (token) {
          auth.setSession(token, {
            id: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
          });
        }
      } else if (isAuthLoaded && !user) {
        auth.clearSession();
      }
    };
    sync();
  }, [isAuthLoaded, isUserLoaded, user, getToken]);

  return null;
};
