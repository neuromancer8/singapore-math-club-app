import type { Locale } from "@/lib/i18n";

export const NOTICE_SHOWN_KEY = "noticeShown";
export const ONBOARDING_DONE_KEY = "onboardingDone";
export const UNLOCKED_BADGES_KEY = "unlockedBadges";
export const OPEN_ONBOARDING_EVENT = "singapore-math-open-onboarding";
export const DISPLAY_NAME_CHANGED_EVENT = "singapore-math-display-name-changed";

function displayNameKey(learnerId: string) {
  return `singapore-math-display-name-${learnerId}`;
}

export function getDisplayNameOverride(learnerId: string) {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(displayNameKey(learnerId));
  return value?.trim() || null;
}

export function saveDisplayNameOverride(learnerId: string, value: string) {
  if (typeof window === "undefined") return;

  const trimmed = value.trim();
  if (!trimmed) {
    localStorage.removeItem(displayNameKey(learnerId));
  } else {
    localStorage.setItem(displayNameKey(learnerId), trimmed);
  }

  window.dispatchEvent(new Event(DISPLAY_NAME_CHANGED_EVENT));
}

export function getLocalStorageNoticeText(locale: Locale) {
  if (locale === "en") {
    return {
      title: "Local progress",
      body: "Your progress is saved in this browser. To avoid losing it, use the same browser and device.",
      close: "Hide notice",
    };
  }

  return {
    title: "Salvataggio locale",
    body: "I tuoi progressi sono salvati in questo browser. Per non perderli, usa sempre lo stesso browser e dispositivo.",
    close: "Nascondi avviso",
  };
}
