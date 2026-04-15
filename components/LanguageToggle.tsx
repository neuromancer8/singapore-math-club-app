"use client";

import { getLocale, setLocale, type Locale } from "@/lib/i18n";

export function LanguageToggle({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange?: (locale: Locale) => void;
}) {
  const nextLocale: Locale = locale === "it" ? "en" : "it";

  return (
    <button
      type="button"
      className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm"
      onClick={() => {
        const current = getLocale();
        const next: Locale = current === "it" ? "en" : "it";

        setLocale(next);
        onChange?.(next);
        window.location.reload();
      }}
      aria-label={locale === "it" ? "Switch to English" : "Passa all'italiano"}
    >
      {nextLocale.toUpperCase()}
    </button>
  );
}
