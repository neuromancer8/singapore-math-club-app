"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getLocalStorageNoticeText, NOTICE_SHOWN_KEY } from "@/lib/user-preferences";

export function LocalStorageNotice({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const text = getLocalStorageNoticeText(locale);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setVisible(localStorage.getItem(NOTICE_SHOWN_KEY) === null);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50/90 px-4 py-4 text-amber-950 shadow-sm" role="status">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl" aria-hidden="true">
          ⚠️
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-amber-700">{text.title}</p>
          <p className="mt-2 mb-0 text-sm font-bold leading-6 text-amber-950">{text.body}</p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-white/80 text-base font-black text-amber-900 shadow-sm transition hover:bg-white"
          onClick={() => {
            localStorage.setItem(NOTICE_SHOWN_KEY, "true");
            setVisible(false);
          }}
          aria-label={text.close}
          title={text.close}
        >
          ×
        </button>
      </div>
    </div>
  );
}
