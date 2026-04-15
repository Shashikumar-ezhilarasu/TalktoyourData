/**
 * Auth bridge for Clerk integration.
 * This file replaces the previous custom auth logic with Clerk.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Since hooks can't be used in api.ts (which is a plain JS file),
// we use this bridge to store and retrieve the token.
// In a real app, you might use a more robust state management or
// pass the token from the component level.

let _token: string | null = null;
let _user: AuthUser | null = null;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const auth = {
  getToken: () => _token,

  getTokenAsync: async () => {
    if (typeof window !== "undefined" && (window as any).Clerk) {
      const clerk = (window as any).Clerk;

      // Clerk may still be initializing when first protected requests fire.
      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (!clerk.loaded) {
          await wait(100);
          continue;
        }
        const session = clerk.session;

        if (session) {
          try {
            const clerkToken = await session.getToken();
            _token = clerkToken || null;
            return _token;
          } catch (e) {
            console.error("Clerk session getToken error:", e);
            return null;
          }
        }

        // If Clerk is loaded and there is no user, we are signed out.
        return null;
      }

      return null;
    }

    return _token;
  },

  getUser: () => _user,

  setSession: (token: string, user: AuthUser) => {
    _token = token;
    _user = user;
    if (typeof window !== "undefined") {
      // Keep token in memory only to avoid stale token issues after auth strategy changes.
      localStorage.removeItem("datalens_token");
      localStorage.setItem("datalens_user", JSON.stringify(user));
    }
  },

  clearSession: () => {
    _token = null;
    _user = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("datalens_token");
      localStorage.removeItem("datalens_user");
    }
  },

  init: () => {
    if (typeof window !== "undefined") {
      // Never bootstrap token from storage; it can be stale or from a previous auth system.
      _token = null;
      localStorage.removeItem("datalens_token");

      const savedUser = localStorage.getItem("datalens_user");
      if (savedUser) {
        try {
          _user = JSON.parse(savedUser);
        } catch {
          _user = null;
        }
      }
    }
  },
};

// Auto-init on load
auth.init();
