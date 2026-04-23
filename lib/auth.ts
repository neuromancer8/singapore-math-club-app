"use client";

import { isAvatarId } from "@/lib/avatars";
import { hydrateProgress } from "@/lib/progress";
import type { AuthSession, AvatarId, SavedProgress, SeedCredential } from "@/lib/types";

const AUTH_STORAGE_KEY = "singapore-math-auth";
const AUTH_TIMEOUT_MS = 24 * 60 * 60 * 1000;

const seedCredentials: SeedCredential[] = [
  { username: "admin", password: "admin", label: "Admin demo" },
  { username: "marco", password: "marco123", label: "Learner demo" },
];

type AuthPayload = {
  session: AuthSession | null;
  progress: SavedProgress | null;
};

function cacheSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function normalizeCachedSession(value: Partial<AuthSession>): AuthSession | null {
  const now = Date.now();
  const loggedInAt = typeof value.loggedInAt === "string" ? value.loggedInAt : new Date(now).toISOString();
  const lastActivityAt = typeof value.lastActivityAt === "string" ? value.lastActivityAt : loggedInAt;
  const lastActivityTime = Date.parse(lastActivityAt);

  if (!Number.isFinite(lastActivityTime) || now - lastActivityTime > AUTH_TIMEOUT_MS) {
    return null;
  }

  if (
    typeof value.userId !== "string" ||
    typeof value.username !== "string" ||
    typeof value.firstName !== "string" ||
    typeof value.lastName !== "string"
  ) {
    return null;
  }

  return {
    userId: value.userId,
    username: value.username,
    role: value.role ?? "learner",
    loggedInAt,
    lastActivityAt,
    firstName: value.firstName,
    lastName: value.lastName,
    fullName: typeof value.fullName === "string" ? value.fullName : `${value.firstName} ${value.lastName}`,
    learnerGrade: value.learnerGrade ?? "seconda",
    avatarId: isAvatarId(value.avatarId) ? value.avatarId : "rocket",
  };
}

export function getSeedCredentials() {
  return seedCredentials;
}

export function getAuthSession(options: { refreshActivity?: boolean } = {}): AuthSession | undefined {
  if (typeof window === "undefined") return undefined;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return undefined;

  try {
    const parsed = normalizeCachedSession(JSON.parse(raw) as Partial<AuthSession>);
    if (!parsed) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return undefined;
    }

    const session = options.refreshActivity === false ? parsed : { ...parsed, lastActivityAt: new Date().toISOString() };
    if (options.refreshActivity !== false) {
      cacheSession(session);
    }
    return session;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return undefined;
  }
}

export async function loadAuthState(options: { refresh?: boolean } = {}) {
  if (typeof window === "undefined") return { session: null, progress: null } satisfies AuthPayload;

  try {
    const search = options.refresh === false ? "?refresh=false" : "";
    const response = await fetch(`/api/auth/session${search}`, { credentials: "same-origin" });
    if (!response.ok) {
      cacheSession(null);
      return { session: null, progress: null } satisfies AuthPayload;
    }

    const data = (await response.json()) as AuthPayload;
    cacheSession(data.session);
    if (data.progress) {
      await hydrateProgress(data.progress);
    }

    return data;
  } catch {
    return { session: getAuthSession({ refreshActivity: false }) ?? null, progress: null } satisfies AuthPayload;
  }
}

export async function refreshAuthActivity() {
  if (typeof window === "undefined") return undefined;

  try {
    const response = await fetch("/api/auth/activity", { method: "POST", credentials: "same-origin" });
    if (!response.ok) {
      cacheSession(null);
      return undefined;
    }

    const data = (await response.json()) as { session?: AuthSession };
    if (data.session) {
      cacheSession(data.session);
      return data.session;
    }
  } catch {
    return getAuthSession();
  }

  return undefined;
}

export async function saveAvatarSelection(avatarId: AvatarId) {
  if (typeof window === "undefined") return undefined;

  try {
    const response = await fetch("/api/auth/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ avatarId }),
    });

    if (!response.ok) return undefined;

    const data = (await response.json()) as { session?: AuthSession };
    if (data.session) {
      cacheSession(data.session);
      return data.session;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function login(username: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return { success: false as const };
  }

  const data = (await response.json()) as { success: true; session: AuthSession; progress: SavedProgress };
  cacheSession(data.session);
  await hydrateProgress(data.progress);

  return {
    success: true as const,
    session: data.session,
    progress: data.progress,
  };
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } finally {
    cacheSession(null);
  }
}
