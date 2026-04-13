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

export const auth = {
  getToken: () => {
    if (typeof window !== "undefined" && (window as any).Clerk) {
        return _token; 
    }
    return _token;
  },

  getTokenAsync: async () => {
    if (typeof window !== "undefined" && (window as any).Clerk && (window as any).Clerk.session) {
        try {
            return await (window as any).Clerk.session.getToken();
        } catch (e) {
            console.error("Clerk session getToken error:", e);
        }
    }
    return _token;
  },
  
  getUser: () => _user,
  
  setSession: (token: string, user: AuthUser) => {
    _token = token;
    _user = user;
    if (typeof window !== "undefined") {
        localStorage.setItem("datalens_token", token);
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
        _token = localStorage.getItem("datalens_token");
        const savedUser = localStorage.getItem("datalens_user");
        if (savedUser) {
            try {
                _user = JSON.parse(savedUser);
            } catch {
                _user = null;
            }
        }
    }
  }
};

// Auto-init on load
auth.init();
