"use client";

import { avatarLabel, avatarOptions, getAvatarOption } from "@/lib/avatars";
import { saveAvatarSelection } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import type { AuthSession } from "@/lib/types";

const avatarText = {
  it: {
    stage: "Profilo sicuro",
    title: "Scegli il tuo avatar",
    description:
      "Usiamo solo disegni e sticker predefiniti, non foto reali dei bambini. La scelta resta salvata nel browser per questa fase pilota.",
    selected: "Selezionato",
    choose: "Scegli",
  },
  en: {
    stage: "Safe profile",
    title: "Choose your avatar",
    description:
      "We only use predefined drawings and stickers, not real photos of children. The choice stays saved in the browser during this pilot phase.",
    selected: "Selected",
    choose: "Choose",
  },
} as const;

export function AvatarPicker({
  session,
  onChange,
  locale = "it",
}: {
  session: AuthSession;
  onChange: (session: AuthSession) => void;
  locale?: Locale;
}) {
  const currentAvatar = getAvatarOption(session.avatarId);
  const t = avatarText[locale];

  return (
    <section className="card p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.stage}</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">{t.title}</h2>
          <p className="mt-3 mb-0 max-w-2xl text-base font-bold leading-7 text-slate-600">
            {t.description}
          </p>
        </div>
        <div className={`flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br ${currentAvatar.gradient} text-5xl shadow-lg ring-4 ring-white`}>
          <span aria-hidden="true">{currentAvatar.symbol}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {avatarOptions.map((avatar) => {
          const selected = avatar.id === session.avatarId;

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={async () => {
                const updatedSession = await saveAvatarSelection(avatar.id);
                if (updatedSession) {
                  onChange(updatedSession);
                }
              }}
              className={`rounded-[26px] border p-4 text-left shadow-sm transition hover:-translate-y-1 ${
                selected ? "border-slate-900 bg-white ring-4 ring-amber-200" : "border-slate-100 bg-white/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br ${avatar.gradient} text-3xl`}>
                  <span aria-hidden="true">{avatar.symbol}</span>
                </div>
                <div>
                  <p className="m-0 text-base font-black text-slate-900">{avatarLabel(avatar, locale)}</p>
                  <p className="mt-1 mb-0 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    {selected ? t.selected : t.choose}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
