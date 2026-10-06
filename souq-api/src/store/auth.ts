import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiError, platzi, type PlatziUser } from "@/lib/platzi";

export type User = { id: string; name: string; email: string; avatar: string };
type Result = { ok: true } | { ok: false; error: string; field?: "email" | "password" };

const toUser = (u: PlatziUser): User => ({ id: String(u.id), name: u.name, email: u.email, avatar: u.avatar });
const message = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong. Try again.");

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  register: (input: { name: string; email: string; password: string }) => Promise<Result>;
  login: (input: { email: string; password: string }) => Promise<Result>;
  /** Re-validates the saved token on page load; refreshes it once if it expired. */
  restore: () => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      register: async ({ name, email, password }) => {
        try {
          const { isAvailable } = await platzi.isEmailAvailable(email);
          if (!isAvailable) return { ok: false, field: "email", error: "An account with this email already exists" };
          await platzi.createUser({ name, email, password });
        } catch (e) {
          return { ok: false, error: message(e) };
        }
        return get().login({ email, password });
      },

      login: async ({ email, password }) => {
        try {
          const tokens = await platzi.login(email, password);
          const profile = await platzi.profile(tokens.access_token);
          set({ user: toUser(profile), accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
          return { ok: true };
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) return { ok: false, error: "Email or password is incorrect." };
          return { ok: false, error: message(e) };
        }
      },

      restore: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken) return;
        try {
          set({ user: toUser(await platzi.profile(accessToken)) });
        } catch (e) {
          if (!(e instanceof ApiError) || e.status !== 401 || !refreshToken) {
            if (e instanceof ApiError && e.status === 401) get().logout();
            return; // network problem: keep the session and try again next load
          }
          try {
            const tokens = await platzi.refresh(refreshToken);
            const profile = await platzi.profile(tokens.access_token);
            set({ user: toUser(profile), accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
          } catch {
            get().logout();
          }
        }
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "souq-auth" }
  )
);
