export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const TOKEN_KEY = "datalens_token";
const USER_KEY = "datalens_user";

const isBrowser = () => typeof window !== "undefined";

export const auth = {
  getToken: () => {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setSession: (token: string, user: AuthUser) => {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession: () => {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): AuthUser | null => {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
};
