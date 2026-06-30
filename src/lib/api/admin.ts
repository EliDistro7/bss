// lib/api/admin.ts
// Typed API client for the admin panel. Wraps fetch, attaches the JWT from
// localStorage, and centralizes error handling so components stay thin.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type PortfolioCategory = "profile" | "website" | "app" | "card" | "proposal";

export interface PortfolioItem {
  _id: string;
  title: string;
  titleSw: string;
  category: PortfolioCategory;
  client: string;
  year: string;
  description: string;
  descriptionSw: string;
  link: string;
  coverUrl: string;
  epubKey: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const TOKEN_KEY = "bss_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // attach Authorization header (default true)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    ...(headers || {}),
  };

  // Only set JSON content-type when we're not sending FormData —
  // letting the browser set the multipart boundary itself for file uploads.
  if (!(rest.body instanceof FormData)) {
    (finalHeaders as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      (finalHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  // 401 anywhere in the admin panel means the session is dead — clear it so
  // the next protected-route check redirects to login instead of looping.
  if (res.status === 401 && auth) {
    clearToken();
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. empty 204) — leave body null
  }

  if (!res.ok) {
    const message = body?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const data = await request<{ success: true; token: string; admin: AdminUser }>(
    "/api/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    }
  );
  setToken(data.token);
  return data.admin;
}

export async function getMe() {
  const data = await request<{ success: true; admin: AdminUser }>("/api/admin/auth/me");
  return data.admin;
}

export function logout() {
  clearToken();
}

// ── Portfolio: reads ──────────────────────────────────────────────────────────

export async function adminListPortfolio() {
  const data = await request<{ success: true; data: PortfolioItem[] }>(
    "/api/portfolio/admin/all"
  );
  return data.data;
}

export async function getPortfolioItem(id: string) {
  const data = await request<{ success: true; data: PortfolioItem }>(
    `/api/portfolio/${id}`
  );
  return data.data;
}

// ── Portfolio: writes ─────────────────────────────────────────────────────────

export type PortfolioInput = Pick<
  PortfolioItem,
  "title" | "titleSw" | "category" | "client" | "year" | "description" | "descriptionSw" | "link" | "published"
>;

export async function createPortfolioItem(input: PortfolioInput) {
  const data = await request<{ success: true; data: PortfolioItem }>("/api/portfolio", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.data;
}

export async function updatePortfolioItem(id: string, input: Partial<PortfolioInput>) {
  const data = await request<{ success: true; data: PortfolioItem }>(
    `/api/portfolio/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
  return data.data;
}

export async function deletePortfolioItem(id: string) {
  await request<{ success: true }>(`/api/portfolio/${id}`, { method: "DELETE" });
}

export async function uploadCover(id: string, file: File) {
  const formData = new FormData();
  formData.append("cover", file);
  const data = await request<{ success: true; data: { coverUrl: string } }>(
    `/api/portfolio/${id}/cover`,
    { method: "POST", body: formData }
  );
  return data.data.coverUrl;
}

export async function uploadEpub(id: string, file: File) {
  const formData = new FormData();
  formData.append("epub", file);
  const data = await request<{ success: true; data: { epubKey: string } }>(
    `/api/portfolio/${id}/epub`,
    { method: "POST", body: formData }
  );
  return data.data.epubKey;
}

export async function deleteEpub(id: string) {
  await request<{ success: true }>(`/api/portfolio/${id}/epub`, { method: "DELETE" });
}

export { ApiError };