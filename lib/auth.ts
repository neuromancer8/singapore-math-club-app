"use client";

import type { AuthSession } from "@/lib/types";

const AUTH_STORAGE_KEY = "singapore-math-auth";

const demoCredentials = {
  username: "admin",
  password: "admin",
} as const;

const demoProfile = {
  firstName: "Giulia",
  lastName: "Rossi",
  learnerGrade: "seconda",
} as const;

export function getDemoCredentials() {
  return demoCredentials;
}

export function getDemoProfile() {
  return demoProfile;
}

export function getAuthSession(): AuthSession | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;

    return {
      username: typeof parsed.username === "string" ? parsed.username : demoCredentials.username,
      role: "admin",
      loggedInAt: typeof parsed.loggedInAt === "string" ? parsed.loggedInAt : new Date().toISOString(),
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : demoProfile.firstName,
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : demoProfile.lastName,
      fullName:
        typeof parsed.fullName === "string"
          ? parsed.fullName
          : `${typeof parsed.firstName === "string" ? parsed.firstName : demoProfile.firstName} ${typeof parsed.lastName === "string" ? parsed.lastName : demoProfile.lastName}`,
      learnerGrade: parsed.learnerGrade ?? demoProfile.learnerGrade,
    };
  } catch {
    return undefined;
  }
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
    firstName: demoProfile.firstName,
    lastName: demoProfile.lastName,
    fullName: `${demoProfile.firstName} ${demoProfile.lastName}`,
    learnerGrade: demoProfile.learnerGrade,
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
