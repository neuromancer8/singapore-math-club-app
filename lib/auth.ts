"use client";

import { isAvatarId } from "@/lib/avatars";
import { hydrateProgress } from "@/lib/progress";
import type {
  AuthPayload,
  AuthSession,
  AvatarId,
  Grade,
  LearnerProfile,
  ParentRegistrationInput,
  SavedProgress,
  SeedCredential,
} from "@/lib/types";

const AUTH_STORAGE_KEY = "singapore-math-auth";
const AUTH_TIMEOUT_MS = 24 * 60 * 60 * 1000;

const seedCredentials: SeedCredential[] = [
  { username: "admin", password: "admin", label: "Famiglia demo 1" },
  { username: "marco", password: "marco123", label: "Famiglia demo 2" },
];

function emptyAuthPayload(): AuthPayload {
  return { session: null, profiles: [], progress: null };
}

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
    typeof value.parentFirstName !== "string" ||
    typeof value.parentLastName !== "string" ||
    typeof value.activeLearnerId !== "string" ||
    typeof value.firstName !== "string" ||
    typeof value.lastName !== "string"
  ) {
    return null;
  }

  return {
    userId: value.userId,
    username: value.username,
    role: value.role === "admin" || value.role === "teacher" ? value.role : "parent",
    loggedInAt,
    lastActivityAt,
    parentFirstName: value.parentFirstName,
    parentLastName: value.parentLastName,
    parentFullName:
      typeof value.parentFullName === "string"
        ? value.parentFullName
        : `${value.parentFirstName} ${value.parentLastName}`.trim(),
    activeLearnerId: value.activeLearnerId,
    firstName: value.firstName,
    lastName: value.lastName,
    fullName: typeof value.fullName === "string" ? value.fullName : `${value.firstName} ${value.lastName}`.trim(),
    learnerGrade: value.learnerGrade ?? "seconda",
    avatarId: isAvatarId(value.avatarId) ? value.avatarId : "rocket",
  };
}

async function parseAuthResponse(response: Response) {
  const data = (await response.json().catch(() => null)) as Partial<AuthPayload> | null;
  const payload: AuthPayload = {
    session: data?.session ?? null,
    profiles: Array.isArray(data?.profiles) ? (data.profiles as LearnerProfile[]) : [],
    progress: data?.progress ?? null,
  };

  cacheSession(payload.session);
  if (payload.progress) {
    await hydrateProgress(payload.progress);
  }

  return payload;
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
  if (typeof window === "undefined") return emptyAuthPayload();

  try {
    const search = options.refresh === false ? "?refresh=false" : "";
    const response = await fetch(`/api/auth/session${search}`, { credentials: "same-origin" });
    if (!response.ok) {
      cacheSession(null);
      return emptyAuthPayload();
    }

    return parseAuthResponse(response);
  } catch {
    return {
      session: getAuthSession({ refreshActivity: false }) ?? null,
      profiles: [],
      progress: null,
    } satisfies AuthPayload;
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

  const data = await parseAuthResponse(response);

  return {
    success: true as const,
    ...data,
  };
}

export async function registerParent(input: ParentRegistrationInput) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { reason?: "invalid" | "exists" } | null;
    return { success: false as const, reason: body?.reason ?? "invalid" };
  }

  const data = await parseAuthResponse(response);
  return {
    success: true as const,
    ...data,
  };
}

export async function createLearnerProfile(input: {
  firstName: string;
  lastName: string;
  learnerGrade: Grade;
  avatarId: AvatarId;
}) {
  const response = await fetch("/api/learners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return { success: false as const };
  }

  const data = await parseAuthResponse(response);
  return {
    success: true as const,
    ...data,
  };
}

export async function switchLearner(learnerId: string) {
  const response = await fetch("/api/learners/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ learnerId }),
  });

  if (!response.ok) {
    return { success: false as const };
  }

  const data = await parseAuthResponse(response);
  return {
    success: true as const,
    ...data,
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
