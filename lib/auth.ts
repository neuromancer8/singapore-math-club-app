"use client";

import type { AuthSession } from "@/lib/types";

const AUTH_STORAGE_KEY = "singapore-math-auth";

const demoCredentials = {
  username: "admin",
  password: "admin",
} as const;

export function getDemoCredentials() {
  return demoCredentials;
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
    return JSON.parse(raw) as AuthSession;
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
