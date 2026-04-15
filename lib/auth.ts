"use client";

import { isAvatarId } from "@/lib/avatars";
import type { AuthSession, AvatarId } from "@/lib/types";

const AUTH_STORAGE_KEY = "singapore-math-auth";
const AUTH_TIMEOUT_MS = 24 * 60 * 60 * 1000;

const demoCredentials = {
  username: "admin",
  password: "admin",
} as const;

const demoProfile = {
  firstName: "Giulia",
  lastName: "Rossi",
  learnerGrade: "seconda",
  avatarId: "rocket",
} as const;

export function getDemoCredentials() {
  return demoCredentials;
}

export function getDemoProfile() {
  return demoProfile;
}

export function getAuthSession(options: { refreshActivity?: boolean } = {}): AuthSession | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    const now = Date.now();
    const loggedInAt = typeof parsed.loggedInAt === "string" ? parsed.loggedInAt : new Date(now).toISOString();
    const lastActivityAt = typeof parsed.lastActivityAt === "string" ? parsed.lastActivityAt : loggedInAt;
    const lastActivityTime = Date.parse(lastActivityAt);

    if (!Number.isFinite(lastActivityTime) || now - lastActivityTime > AUTH_TIMEOUT_MS) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return undefined;
    }

    const session: AuthSession = {
      username: typeof parsed.username === "string" ? parsed.username : demoCredentials.username,
      role: "admin",
      loggedInAt,
      lastActivityAt: options.refreshActivity === false ? lastActivityAt : new Date(now).toISOString(),
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : demoProfile.firstName,
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : demoProfile.lastName,
      fullName:
        typeof parsed.fullName === "string"
          ? parsed.fullName
          : `${typeof parsed.firstName === "string" ? parsed.firstName : demoProfile.firstName} ${typeof parsed.lastName === "string" ? parsed.lastName : demoProfile.lastName}`,
      learnerGrade: parsed.learnerGrade ?? demoProfile.learnerGrade,
      avatarId: isAvatarId(parsed.avatarId) ? parsed.avatarId : demoProfile.avatarId,
    };

    if (options.refreshActivity !== false) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }

    return session;
  } catch {
    return undefined;
  }
}

export function refreshAuthActivity() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const current = getAuthSession({ refreshActivity: false });
  if (!current) {
    return undefined;
  }

  const next: AuthSession = {
    ...current,
    lastActivityAt: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));

  return next;
}

export function saveAvatarSelection(avatarId: AvatarId) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const current = getAuthSession();
  if (!current) {
    return undefined;
  }

  const next: AuthSession = {
    ...current,
    avatarId,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));

  return next;
}

export function login(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (normalizedUsername !== demoCredentials.username || normalizedPassword !== demoCredentials.password) {
    return { success: false as const };
  }

  const session: AuthSession = {
    username: demoCredentials.username,
    role: "admin",
    loggedInAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    firstName: demoProfile.firstName,
    lastName: demoProfile.lastName,
    fullName: `${demoProfile.firstName} ${demoProfile.lastName}`,
    learnerGrade: demoProfile.learnerGrade,
    avatarId: demoProfile.avatarId,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

  return {
    success: true as const,
    session,
  };
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}
