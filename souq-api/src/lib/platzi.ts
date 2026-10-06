// Accounts come from the Platzi Fake Store API (https://fakeapi.platzi.com), called through the
// /api/platzi proxy defined in next.config.mjs. It's a shared public database — never use a real password.

const BASE = "/api/platzi";

export type PlatziUser = { id: number; name: string; email: string; avatar: string; role: string };
export type Tokens = { access_token: string; refresh_token: string };

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Can't reach the account server. Check your connection and try again.", 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new ApiError(typeof msg === "string" ? msg : `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

export const platzi = {
  isEmailAvailable: (email: string) =>
    request<{ isAvailable: boolean }>("/users/is-available", { method: "POST", body: JSON.stringify({ email }) }),

  createUser: (input: { name: string; email: string; password: string }) =>
    request<PlatziUser>("/users/", {
      method: "POST",
      body: JSON.stringify({ ...input, avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(input.name)}` }),
    }),

  login: (email: string, password: string) =>
    request<Tokens>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  profile: (accessToken: string) =>
    request<PlatziUser>("/auth/profile", { headers: { Authorization: `Bearer ${accessToken}` } }),

  refresh: (refreshToken: string) =>
    request<Tokens>("/auth/refresh-token", { method: "POST", body: JSON.stringify({ refreshToken }) }),
};
