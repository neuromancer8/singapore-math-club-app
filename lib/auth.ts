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
  SeedCredential,
} from "@/lib/types";

const AUTH_STORAGE_KEY = "singapore-math-auth";
const AUTH_TIMEOUT_MS = 24 * 60 * 60 * 1000;

const seedCredentials: SeedCredential[] = [
  { email: "laura.rossi@demo-rotary.it", password: "admin", label: "Famiglia demo 1" },
  { email: "paolo.bianchi@demo-rotary.it", password: "marco123", label: "Famiglia demo 2" },
  { email: "docente@singaporemathclub.app", password: "teacher123", label: "Docente demo" },
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

function normalizeCachedSession(value: Partial<AuthSession> & { username?: string }): AuthSession | null {
  const now = Date.now();
  const loggedInAt = typeof value.loggedInAt === "string" ? value.loggedInAt : new Date(now).toISOString();
  const lastActivityAt = typeof value.lastActivityAt === "string" ? value.lastActivityAt : loggedInAt;
  const lastActivityTime = Date.parse(lastActivityAt);
  const email = typeof value.email === "string" ? value.email : value.username;

  if (!Number.isFinite(lastActivityTime) || now - lastActivityTime > AUTH_TIMEOUT_MS) {
    return null;
  }

  if (
    typeof value.userId !== "string" ||
    typeof email !== "string" ||
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
    email,
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
    const parsed = normalizeCachedSession(JSON.parse(raw) as Partial<AuthSession> & { username?: string });
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

export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { reason?: "invalid" | "verification_required"; email?: string } | null;
    return { success: false as const, reason: body?.reason ?? "invalid", email: body?.email };
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

  return {
    success: true as const,
    ...(await response.json()),
  };
}

export async function requestEmailVerification(email: string) {
  const response = await fetch("/api/auth/request-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email }),
  });

  const body = (await response.json().catch(() => null)) as { success?: boolean; previewUrl?: string; delivered?: boolean; reason?: string } | null;
  if (!response.ok || !body?.success) {
    return { success: false as const, reason: body?.reason ?? "invalid" };
  }

  return { success: true as const, previewUrl: body.previewUrl, delivered: body.delivered };
}

export async function requestPasswordReset(email: string) {
  const response = await fetch("/api/auth/request-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email }),
  });

  const body = (await response.json().catch(() => null)) as { success?: boolean; previewUrl?: string; delivered?: boolean; reason?: string } | null;
  if (!response.ok || !body?.success) {
    return { success: false as const, reason: body?.reason ?? "invalid" };
  }

  return { success: true as const, previewUrl: body.previewUrl, delivered: body.delivered };
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
