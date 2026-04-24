"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AvatarPicker } from "@/components/AvatarPicker";
import { LanguageToggle } from "@/components/LanguageToggle";
import { avatarLabel, avatarOptions, getAvatarOption } from "@/lib/avatars";
import {
  createLearnerProfile,
  getAuthSession,
  getSeedCredentials,
  loadAuthState,
  login,
  logout,
  refreshAuthActivity,
  registerParent,
  switchLearner,
} from "@/lib/auth";
import { getLocale, gradeLabel, uiText, type Locale } from "@/lib/i18n";
import { getProgress } from "@/lib/progress";
import type { AuthSession, AvatarId, Grade, LearnerProfile, ParentRegistrationInput, SavedProgress } from "@/lib/types";

type AuthMode = "login" | "register";

const defaultRegistration: ParentRegistrationInput = {
  parentFirstName: "",
  parentLastName: "",
  username: "",
  password: "",
  childFirstName: "",
  childLastName: "",
  childGrade: "seconda",
  childAvatarId: "rocket",
};

const defaultChildForm = {
  firstName: "",
  lastName: "",
  learnerGrade: "seconda" as Grade,
  avatarId: "rocket" as AvatarId,
};

export function Header() {
  const [session, setSession] = useState<AuthSession | undefined>();
  const [profiles, setProfiles] = useState<LearnerProfile[]>([]);
  const [progress, setProgress] = useState<SavedProgress | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState<string>(getSeedCredentials()[0]?.username ?? "admin");
  const [password, setPassword] = useState<string>(getSeedCredentials()[0]?.password ?? "admin");
  const [registration, setRegistration] = useState<ParentRegistrationInput>(defaultRegistration);
  const [childForm, setChildForm] = useState(defaultChildForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingChild, setSavingChild] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("it");
  const seedCredentials = getSeedCredentials();
  const t = uiText[locale];

  useEffect(() => {
    setLocaleState(getLocale());
    setSession(getAuthSession({ refreshActivity: false }));
    setProgress(getProgress());

    void loadAuthState({ refresh: false }).then(({ session: serverSession, profiles: serverProfiles, progress: serverProgress }) => {
      setSession(serverSession ?? undefined);
      setProfiles(serverProfiles);
      setProgress(serverSession ? (serverProgress ?? getProgress()) : null);
    });
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    let lastRefresh = 0;

    const refreshOnActivity = () => {
      const now = Date.now();
      if (now - lastRefresh < 60_000) {
        return;
      }

      lastRefresh = now;
      void refreshAuthActivity().then((nextSession) => {
        if (nextSession) {
          setSession(nextSession);
        }
      });
    };

    const checkSession = () => {
      void loadAuthState({ refresh: false }).then(({ session: activeSession, profiles: nextProfiles, progress: nextProgress }) => {
        if (!activeSession) {
          void logout().then(() => window.location.reload());
          return;
        }

        setSession(activeSession);
        setProfiles(nextProfiles);
        if (nextProgress) {
          setProgress(nextProgress);
        }
      });
    };

    const events = ["click", "keydown", "pointermove", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, refreshOnActivity, { passive: true }));
    const intervalId = window.setInterval(checkSession, 60_000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, refreshOnActivity));
      window.clearInterval(intervalId);
    };
  }, [session]);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === session?.activeLearnerId) ?? null,
    [profiles, session?.activeLearnerId],
  );
  const activeAvatar = session ? getAvatarOption(session.avatarId) : undefined;

  async function handleLogout() {
    await logout();
    window.location.reload();
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await login(username, password);

    if (!result.success) {
      setError(t.invalidCredentials);
      setLoading(false);
      return;
    }

    if (!result.session) {
      setError(t.invalidCredentials);
      setLoading(false);
      return;
    }

    setError("");
    setSession(result.session);
    setProfiles(result.profiles);
    setProgress(result.progress);
    setAuthOpen(false);
    setLoading(false);
    window.location.reload();
  }

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await registerParent(registration);

    if (!result.success) {
      setError(result.reason === "exists" ? t.usernameTaken : t.registerInvalid);
      setLoading(false);
      return;
    }

    if (!result.session) {
      setError(t.registerInvalid);
      setLoading(false);
      return;
    }

    setError("");
    setSession(result.session);
    setProfiles(result.profiles);
    setProgress(result.progress);
    setRegistration(defaultRegistration);
    setAuthOpen(false);
    setLoading(false);
    window.location.reload();
  }

  async function handleSwitchLearner(learnerId: string) {
    const result = await switchLearner(learnerId);
    if (!result.success || !result.session) return;

    setSession(result.session);
    setProfiles(result.profiles);
    setProgress(result.progress);
    setProfileOpen(false);
    window.location.reload();
  }

  async function handleCreateLearner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingChild(true);
    const result = await createLearnerProfile(childForm);

    if (!result.success) {
      setSavingChild(false);
      return;
    }

    setProfiles(result.profiles);
    if (result.session) {
      setSession(result.session);
    }
    if (result.progress) {
      setProgress(result.progress);
    }
    setChildForm(defaultChildForm);
    setSavingChild(false);
  }

  return (
    <header className="sticky top-0 z-30 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[30px] border border-white/55 bg-white/72 px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-6">
        <Link href="/" className="flex items-center gap-4">
          <div className="overflow-hidden rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
            <Image
              src="/logo-rotary.jpg"
              alt={locale === "it" ? "Rotary Distretto 2041" : "Rotary District 2041"}
              width={170}
              height={66}
              className="h-auto w-[140px] md:w-[170px]"
              priority
            />
          </div>
          <div>
            <p className="section-title m-0 text-2xl font-black text-slate-900">Singapore Math Club</p>
            <p className="m-0 text-sm font-extrabold text-slate-600">{t.appSubtitle}</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-slate-800">
          {session ? (
            <>
              <Link href="/" className="pill bg-[var(--surface-soft)] shadow-sm">
                {t.navHome}
              </Link>
              <Link href="/risultati" className="pill bg-white ring-1 ring-black/5 shadow-sm">
                {t.navResults}
              </Link>
              <Link href="/genitori" className="pill bg-[var(--sky)] shadow-sm">
                {t.navParents}
              </Link>
            </>
          ) : null}

          {session && progress?.currentGrade ? (
            <span className="pill bg-white ring-1 ring-black/5 shadow-sm">
              {t.activeClass}: {gradeLabel(progress.currentGrade, locale)}
            </span>
          ) : null}

          {session ? (
            <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-1 py-0.5 transition hover:-translate-y-0.5"
                onClick={() => setProfileOpen(true)}
                aria-label={t.profile}
              >
                {activeAvatar ? (
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${activeAvatar.gradient} text-lg`}
                    aria-label={avatarLabel(activeAvatar, locale)}
                  >
                    {activeAvatar.symbol}
                  </span>
                ) : null}
                <span className="rounded-full px-3 py-2 font-extrabold text-slate-800">{t.profile}</span>
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-full border-0 bg-rose-50 px-4 py-3 font-extrabold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                onClick={handleLogout}
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm"
              onClick={() => {
                setError("");
                setAuthOpen(true);
              }}
            >
              {t.login}
            </button>
          )}

          <LanguageToggle locale={locale} onChange={setLocaleState} />
        </nav>
      </div>

      {authOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[36px] border border-white/60 bg-white/92 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
                  {t.familyAccess}
                </div>
                <h2 className="section-title mt-4 text-4xl font-black text-slate-900">
                  {authMode === "login" ? t.loginTitle : t.createParentAccount}
                </h2>
                <p className="mt-3 text-base font-bold leading-7 text-slate-600">
                  {authMode === "login" ? t.loginDescription : t.registerDescription}
                </p>
              </div>
              <button
                type="button"
                className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm"
                onClick={() => setAuthOpen(false)}
              >
                {t.close}
              </button>
            </div>

            <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1">
              <button
                type="button"
                className={`rounded-full px-4 py-2 font-black ${authMode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}
                onClick={() => {
                  setError("");
                  setAuthMode("login");
                }}
              >
                {t.haveAccount}
              </button>
              <button
                type="button"
                className={`rounded-full px-4 py-2 font-black ${authMode === "register" ? "bg-white shadow-sm" : "text-slate-500"}`}
                onClick={() => {
                  setError("");
                  setAuthMode("register");
                }}
              >
                {t.createAccount}
              </button>
            </div>

            {authMode === "login" ? (
              <form className="mt-8 space-y-4" onSubmit={handleLoginSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">{t.username}</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-xl font-black text-slate-900"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">{t.password}</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-xl font-black text-slate-900"
                  />
                </label>

                {error ? <p className="m-0 rounded-[20px] bg-rose-100 px-4 py-3 text-base font-black text-rose-900">{error}</p> : null}

                <button type="submit" className="cta-primary w-full border-0">
                  {loading ? (locale === "it" ? "Accesso in corso..." : "Logging in...") : t.loginWithAdmin}
                </button>
              </form>
            ) : (
              <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleRegistrationSubmit}>
                <Field label={t.parentFirstName}>
                  <input
                    value={registration.parentFirstName}
                    onChange={(event) => setRegistration((current) => ({ ...current, parentFirstName: event.target.value }))}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  />
                </Field>
                <Field label={t.parentLastName}>
                  <input
                    value={registration.parentLastName}
                    onChange={(event) => setRegistration((current) => ({ ...current, parentLastName: event.target.value }))}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  />
                </Field>
                <Field label={t.username}>
                  <input
                    value={registration.username}
                    onChange={(event) => setRegistration((current) => ({ ...current, username: event.target.value }))}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  />
                </Field>
                <Field label={t.password}>
                  <input
                    type="password"
                    value={registration.password}
                    onChange={(event) => setRegistration((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  />
                </Field>
                <Field label={t.childFirstName}>
                  <input
                    value={registration.childFirstName}
                    onChange={(event) => setRegistration((current) => ({ ...current, childFirstName: event.target.value }))}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  />
                </Field>
                <Field label={t.childLastName}>
                  <input
                    value={registration.childLastName}
                    onChange={(event) => setRegistration((current) => ({ ...current, childLastName: event.target.value }))}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  />
                </Field>
                <Field label={t.childGrade}>
                  <select
                    value={registration.childGrade}
                    onChange={(event) => setRegistration((current) => ({ ...current, childGrade: event.target.value as Grade }))}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  >
                    <option value="seconda">{gradeLabel("seconda", locale)}</option>
                    <option value="terza">{gradeLabel("terza", locale)}</option>
                    <option value="quarta">{gradeLabel("quarta", locale)}</option>
                  </select>
                </Field>
                <Field label={t.childAvatar}>
                  <select
                    value={registration.childAvatarId}
                    onChange={(event) =>
                      setRegistration((current) => ({ ...current, childAvatarId: event.target.value as AvatarId }))
                    }
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                  >
                    {avatarOptions.map((avatar) => (
                      <option key={avatar.id} value={avatar.id}>
                        {avatarLabel(avatar, locale)}
                      </option>
                    ))}
                  </select>
                </Field>

                {error ? (
                  <p className="m-0 rounded-[20px] bg-rose-100 px-4 py-3 text-base font-black text-rose-900 md:col-span-2">{error}</p>
                ) : null}

                <button type="submit" className="cta-primary w-full border-0 md:col-span-2">
                  {loading ? (locale === "it" ? "Creazione in corso..." : "Creating account...") : t.registerNow}
                </button>
              </form>
            )}

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
              <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-slate-400">{t.demoCredentials}</p>
              {seedCredentials.map((credential) => (
                <p key={credential.username} className="mt-2 mb-0 text-base font-black text-slate-800">
                  {credential.label}: {credential.username} / {credential.password}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {profileOpen && session ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[36px] border border-white/60 bg-white/94 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.18)] md:p-7">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
                  {t.parentArea}
                </div>
                <h2 className="section-title mt-4 text-4xl font-black leading-tight text-slate-900">
                  {session.parentFullName}
                </h2>
                <p className="mt-3 mb-0 text-base font-bold leading-7 text-slate-600">{t.profileDescription}</p>
              </div>
              <button
                type="button"
                className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm"
                onClick={() => setProfileOpen(false)}
              >
                {t.close}
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="card p-6 md:p-8">
                <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.childProfiles}</p>
                <h3 className="section-title mt-3 text-3xl font-black text-slate-900">{t.familyProfiles}</h3>
                <div className="mt-6 grid gap-4">
                  {profiles.map((profile) => {
                    const avatar = getAvatarOption(profile.avatarId);
                    const selected = profile.id === session.activeLearnerId;
                    return (
                      <div
                        key={profile.id}
                        className={`rounded-[28px] border p-4 shadow-sm ${selected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br ${avatar.gradient} text-3xl`}>
                              {avatar.symbol}
                            </span>
                            <div>
                              <p className="m-0 text-lg font-black text-slate-900">{profile.fullName}</p>
                              <p className="mt-1 mb-0 text-sm font-black text-slate-500">
                                {gradeLabel(profile.learnerGrade, locale)} · {avatarLabel(avatar, locale)}
                              </p>
                            </div>
                          </div>
                          {selected ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">{t.currentProfile}</span>
                          ) : (
                            <button
                              type="button"
                              className="pill cursor-pointer border-0 bg-[var(--surface-soft)]"
                              onClick={() => void handleSwitchLearner(profile.id)}
                            >
                              {t.switchProfile}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="card p-6 md:p-8">
                <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.addChild}</p>
                <h3 className="section-title mt-3 text-3xl font-black text-slate-900">{t.createAnotherChild}</h3>
                <p className="mt-3 mb-0 text-base font-bold leading-7 text-slate-600">{t.addChildDescription}</p>

                <form className="mt-6 grid gap-4" onSubmit={handleCreateLearner}>
                  <Field label={t.childFirstName}>
                    <input
                      value={childForm.firstName}
                      onChange={(event) => setChildForm((current) => ({ ...current, firstName: event.target.value }))}
                      className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                    />
                  </Field>
                  <Field label={t.childLastName}>
                    <input
                      value={childForm.lastName}
                      onChange={(event) => setChildForm((current) => ({ ...current, lastName: event.target.value }))}
                      className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                    />
                  </Field>
                  <Field label={t.childGrade}>
                    <select
                      value={childForm.learnerGrade}
                      onChange={(event) => setChildForm((current) => ({ ...current, learnerGrade: event.target.value as Grade }))}
                      className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                    >
                      <option value="seconda">{gradeLabel("seconda", locale)}</option>
                      <option value="terza">{gradeLabel("terza", locale)}</option>
                      <option value="quarta">{gradeLabel("quarta", locale)}</option>
                    </select>
                  </Field>
                  <Field label={t.childAvatar}>
                    <select
                      value={childForm.avatarId}
                      onChange={(event) => setChildForm((current) => ({ ...current, avatarId: event.target.value as AvatarId }))}
                      className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
                    >
                      {avatarOptions.map((avatar) => (
                        <option key={avatar.id} value={avatar.id}>
                          {avatarLabel(avatar, locale)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button type="submit" className="cta-primary w-full border-0">
                    {savingChild ? (locale === "it" ? "Salvataggio..." : "Saving...") : t.saveChild}
                  </button>
                </form>
              </section>
            </div>

            <div className="mt-6">
              <AvatarPicker
                session={session}
                onChange={(nextSession) => {
                  setSession(nextSession);
                  setProfiles((current) =>
                    current.map((profile) =>
                      profile.id === nextSession.activeLearnerId ? { ...profile, avatarId: nextSession.avatarId } : profile,
                    ),
                  );
                }}
                locale={locale}
              />
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button type="button" className="cta-secondary cursor-pointer border-0" onClick={handleLogout}>
                {t.logoutFrom} {session.parentFirstName}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
