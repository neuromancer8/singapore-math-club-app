"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  requestEmailVerification,
  requestPasswordReset,
  switchLearner,
} from "@/lib/auth";
import { getLocale, gradeLabel, uiText, type Locale } from "@/lib/i18n";
import { getProgress } from "@/lib/progress";
import type { AuthSession, AvatarId, Grade, LearnerProfile, ParentRegistrationInput, SavedProgress } from "@/lib/types";

type AuthMode = "login" | "register" | "recover";

const defaultRegistration: ParentRegistrationInput = {
  parentFirstName: "",
  parentLastName: "",
  email: "",
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
  const [email, setEmail] = useState<string>(getSeedCredentials()[0]?.email ?? "laura.rossi@demo-rotary.it");
  const [password, setPassword] = useState<string>(getSeedCredentials()[0]?.password ?? "admin");
  const [registration, setRegistration] = useState<ParentRegistrationInput>(defaultRegistration);
  const [childForm, setChildForm] = useState(defaultChildForm);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingChild, setSavingChild] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("it");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegistrationPassword, setShowRegistrationPassword] = useState(false);
  const [registrationConfirmPassword, setRegistrationConfirmPassword] = useState("");
  const [showRegistrationConfirmPassword, setShowRegistrationConfirmPassword] = useState(false);
  const seedCredentials = getSeedCredentials();
  const t = uiText[locale];
  const hasParentIdentity = Boolean(registration.parentFirstName.trim() && registration.parentLastName.trim());
  const hasChildIdentity = Boolean(registration.childFirstName.trim() && registration.childLastName.trim());
  const hasValidRegistrationEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email.trim());
  const hasStrongRegistrationPassword = registration.password.trim().length >= 8;
  const passwordsMatch = Boolean(registrationConfirmPassword) && registration.password === registrationConfirmPassword;

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
    if (!session) return;

    let lastRefresh = 0;

    const refreshOnActivity = () => {
      const now = Date.now();
      if (now - lastRefresh < 60_000) return;

      lastRefresh = now;
      void refreshAuthActivity().then((nextSession) => {
        if (nextSession) setSession(nextSession);
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
        if (nextProgress) setProgress(nextProgress);
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

  const activeAvatar = session ? getAvatarOption(session.avatarId) : undefined;

  function resetAuthMessages() {
    setError("");
    setInfo("");
    setPreviewUrl(null);
  }

  async function handleLogout() {
    await logout();
    window.location.reload();
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    resetAuthMessages();

    const result = await login(email, password);
    if (!result.success) {
      if (result.reason === "verification_required") {
        setPendingVerificationEmail(result.email ?? email);
        setError(t.verificationPending);
      } else {
        setError(t.invalidCredentials);
      }
      setLoading(false);
      return;
    }

    if (!result.session) {
      setError(t.invalidCredentials);
      setLoading(false);
      return;
    }

    setSession(result.session);
    setProfiles(result.profiles);
    setProgress(result.progress);
    setAuthOpen(false);
    setLoading(false);
    window.location.reload();
  }

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetAuthMessages();

    if (!hasParentIdentity || !hasChildIdentity) {
      setError(t.registerInvalid);
      return;
    }

    if (!hasValidRegistrationEmail) {
      setError(t.registerInvalidEmail);
      return;
    }

    if (!hasStrongRegistrationPassword) {
      setError(t.registerPasswordShort);
      return;
    }

    if (!passwordsMatch) {
      setError(t.registerPasswordMismatch);
      return;
    }

    setLoading(true);

    const result = await registerParent(registration);
    if (!result.success) {
      setError(result.reason === "exists" ? t.emailTaken : t.registerInvalid);
      setLoading(false);
      return;
    }

    setInfo(t.verificationRequired);
    setPreviewUrl(result.previewUrl ?? null);
    setPendingVerificationEmail(registration.email);
    setRegistration(defaultRegistration);
    setRegistrationConfirmPassword("");
    setShowRegistrationPassword(false);
    setShowRegistrationConfirmPassword(false);
    setAuthMode("login");
    setLoading(false);
  }

  async function handleResendVerification() {
    if (!pendingVerificationEmail) return;
    resetAuthMessages();
    setLoading(true);
    const result = await requestEmailVerification(pendingVerificationEmail);
    if (!result.success) {
      setError(t.registerInvalid);
      setLoading(false);
      return;
    }
    setInfo(t.emailSent);
    setPreviewUrl(result.previewUrl ?? null);
    setLoading(false);
  }

  async function handlePasswordRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    resetAuthMessages();

    const result = await requestPasswordReset(email);
    if (!result.success) {
      setError(t.invalidCredentials);
      setLoading(false);
      return;
    }

    setInfo(t.emailSent);
    setPreviewUrl(result.previewUrl ?? null);
    setLoading(false);
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
    if (result.session) setSession(result.session);
    if (result.progress) setProgress(result.progress);
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
              <Link href="/" className="pill bg-[var(--surface-soft)] shadow-sm">{t.navHome}</Link>
              <Link href="/risultati" className="pill bg-white ring-1 ring-black/5 shadow-sm">{t.navResults}</Link>
              <Link href="/genitori" className="pill bg-[var(--sky)] shadow-sm">{t.navParents}</Link>
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
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${activeAvatar.gradient} text-lg`} aria-label={avatarLabel(activeAvatar, locale)}>
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
                resetAuthMessages();
                setAuthMode("login");
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
                  {authMode === "login" ? t.loginTitle : authMode === "register" ? t.createParentAccount : t.passwordRecovery}
                </h2>
                <p className="mt-3 text-base font-bold leading-7 text-slate-600">
                  {authMode === "login" ? t.loginDescription : authMode === "register" ? t.registerDescription : t.recoveryDescription}
                </p>
              </div>
              <button type="button" className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm" onClick={() => setAuthOpen(false)}>
                {t.close}
              </button>
            </div>

            <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1">
              <button type="button" className={`rounded-full px-4 py-2 font-black ${authMode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`} onClick={() => { resetAuthMessages(); setAuthMode("login"); }}>
                {t.haveAccount}
              </button>
              <button type="button" className={`rounded-full px-4 py-2 font-black ${authMode === "register" ? "bg-white shadow-sm" : "text-slate-500"}`} onClick={() => { resetAuthMessages(); setAuthMode("register"); }}>
                {t.createAccount}
              </button>
              <button type="button" className={`rounded-full px-4 py-2 font-black ${authMode === "recover" ? "bg-white shadow-sm" : "text-slate-500"}`} onClick={() => { resetAuthMessages(); setAuthMode("recover"); }}>
                {t.passwordRecovery}
              </button>
            </div>

            {authMode === "login" ? (
              <form className="mt-8 space-y-4" onSubmit={handleLoginSubmit}>
                <Field label={t.email}>
                  <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-xl font-black text-slate-900" />
                </Field>
                <Field label={t.password}>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    visible={showLoginPassword}
                    onToggleVisibility={() => setShowLoginPassword((current) => !current)}
                    size="xl"
                    locale={locale}
                  />
                </Field>
                <StatusMessage error={error} info={info} previewUrl={previewUrl} previewLabel={t.previewLink} />
                <button type="submit" className="cta-primary w-full border-0">
                  {loading ? (locale === "it" ? "Accesso in corso..." : "Logging in...") : t.loginWithAdmin}
                </button>
                {error === t.verificationPending ? (
                  <button type="button" className="cta-secondary w-full border-0" onClick={() => void handleResendVerification()}>
                    {t.resendVerification}
                  </button>
                ) : null}
                <button type="button" className="w-full text-sm font-black text-slate-500 underline" onClick={() => { resetAuthMessages(); setAuthMode("recover"); }}>
                  {t.forgotPassword}
                </button>
              </form>
            ) : null}

            {authMode === "register" ? (
              <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleRegistrationSubmit}>
                <Field label={t.parentFirstName}>
                  <input required value={registration.parentFirstName} onChange={(event) => setRegistration((current) => ({ ...current, parentFirstName: event.target.value }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900" />
                </Field>
                <Field label={t.parentLastName}>
                  <input required value={registration.parentLastName} onChange={(event) => setRegistration((current) => ({ ...current, parentLastName: event.target.value }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900" />
                </Field>
                <Field label={t.email}>
                  <input required type="email" value={registration.email} onChange={(event) => setRegistration((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900" />
                </Field>
                <Field label={t.password}>
                  <PasswordInput
                    value={registration.password}
                    onChange={(value) => setRegistration((current) => ({ ...current, password: value }))}
                    visible={showRegistrationPassword}
                    onToggleVisibility={() => setShowRegistrationPassword((current) => !current)}
                    size="lg"
                    locale={locale}
                  />
                </Field>
                <Field label={t.confirmPassword}>
                  <PasswordInput
                    value={registrationConfirmPassword}
                    onChange={setRegistrationConfirmPassword}
                    visible={showRegistrationConfirmPassword}
                    onToggleVisibility={() => setShowRegistrationConfirmPassword((current) => !current)}
                    size="lg"
                    locale={locale}
                  />
                </Field>
                <Field label={t.childFirstName}>
                  <input required value={registration.childFirstName} onChange={(event) => setRegistration((current) => ({ ...current, childFirstName: event.target.value }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900" />
                </Field>
                <Field label={t.childLastName}>
                  <input required value={registration.childLastName} onChange={(event) => setRegistration((current) => ({ ...current, childLastName: event.target.value }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900" />
                </Field>
                <Field label={t.childGrade}>
                  <select value={registration.childGrade} onChange={(event) => setRegistration((current) => ({ ...current, childGrade: event.target.value as Grade }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900">
                    <option value="seconda">{gradeLabel("seconda", locale)}</option>
                    <option value="terza">{gradeLabel("terza", locale)}</option>
                    <option value="quarta">{gradeLabel("quarta", locale)}</option>
                  </select>
                </Field>
                <Field label={t.childAvatar}>
                  <select value={registration.childAvatarId} onChange={(event) => setRegistration((current) => ({ ...current, childAvatarId: event.target.value as AvatarId }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900">
                    {avatarOptions.map((avatar) => (
                      <option key={avatar.id} value={avatar.id}>{avatarLabel(avatar, locale)}</option>
                    ))}
                  </select>
                </Field>
                <div className="rounded-[24px] bg-slate-50 p-4 md:col-span-2">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-slate-400">{t.registerChecklistTitle}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <ValidationRow ok={hasParentIdentity} label={t.registerCheckParent} />
                    <ValidationRow ok={hasChildIdentity} label={t.registerCheckChild} />
                    <ValidationRow ok={hasValidRegistrationEmail} label={t.registerCheckEmail} />
                    <ValidationRow ok={hasStrongRegistrationPassword} label={t.registerCheckPassword} />
                    <ValidationRow ok={passwordsMatch} label={t.registerCheckConfirm} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <StatusMessage error={error} info={info} previewUrl={previewUrl} previewLabel={t.previewLink} />
                </div>
                <button type="submit" className="cta-primary w-full border-0 md:col-span-2">
                  {loading ? (locale === "it" ? "Creazione in corso..." : "Creating account...") : t.registerNow}
                </button>
              </form>
            ) : null}

            {authMode === "recover" ? (
              <form className="mt-8 space-y-4" onSubmit={handlePasswordRecovery}>
                <Field label={t.email}>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-xl font-black text-slate-900" />
                </Field>
                <StatusMessage error={error} info={info} previewUrl={previewUrl} previewLabel={t.previewLink} />
                <button type="submit" className="cta-primary w-full border-0">
                  {loading ? (locale === "it" ? "Invio in corso..." : "Sending...") : t.sendRecoveryLink}
                </button>
                <button type="button" className="w-full text-sm font-black text-slate-500 underline" onClick={() => { resetAuthMessages(); setAuthMode("login"); }}>
                  {t.backToLogin}
                </button>
              </form>
            ) : null}

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
              <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-slate-400">{t.demoCredentials}</p>
              {seedCredentials.map((credential) => (
                <p key={credential.email} className="mt-2 mb-0 text-base font-black text-slate-800">
                  {credential.label}: {credential.email} / {credential.password}
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
                <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">{t.parentArea}</div>
                <h2 className="section-title mt-4 text-4xl font-black leading-tight text-slate-900">{session.parentFullName}</h2>
                <p className="mt-3 mb-0 text-base font-bold leading-7 text-slate-600">{t.profileDescription}</p>
                <p className="mt-2 mb-0 text-sm font-black text-slate-500">{session.email}</p>
              </div>
              <button type="button" className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm" onClick={() => setProfileOpen(false)}>
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
                      <div key={profile.id} className={`rounded-[28px] border p-4 shadow-sm ${selected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br ${avatar.gradient} text-3xl`}>{avatar.symbol}</span>
                            <div>
                              <p className="m-0 text-lg font-black text-slate-900">{profile.fullName}</p>
                              <p className="mt-1 mb-0 text-sm font-black text-slate-500">{gradeLabel(profile.learnerGrade, locale)} · {avatarLabel(avatar, locale)}</p>
                            </div>
                          </div>
                          {selected ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">{t.currentProfile}</span>
                          ) : (
                            <button type="button" className="pill cursor-pointer border-0 bg-[var(--surface-soft)]" onClick={() => void handleSwitchLearner(profile.id)}>
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
                    <input value={childForm.firstName} onChange={(event) => setChildForm((current) => ({ ...current, firstName: event.target.value }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900" />
                  </Field>
                  <Field label={t.childLastName}>
                    <input value={childForm.lastName} onChange={(event) => setChildForm((current) => ({ ...current, lastName: event.target.value }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900" />
                  </Field>
                  <Field label={t.childGrade}>
                    <select value={childForm.learnerGrade} onChange={(event) => setChildForm((current) => ({ ...current, learnerGrade: event.target.value as Grade }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900">
                      <option value="seconda">{gradeLabel("seconda", locale)}</option>
                      <option value="terza">{gradeLabel("terza", locale)}</option>
                      <option value="quarta">{gradeLabel("quarta", locale)}</option>
                    </select>
                  </Field>
                  <Field label={t.childAvatar}>
                    <select value={childForm.avatarId} onChange={(event) => setChildForm((current) => ({ ...current, avatarId: event.target.value as AvatarId }))} className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900">
                      {avatarOptions.map((avatar) => (
                        <option key={avatar.id} value={avatar.id}>{avatarLabel(avatar, locale)}</option>
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
                    current.map((profile) => (profile.id === nextSession.activeLearnerId ? { ...profile, avatarId: nextSession.avatarId } : profile)),
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

function ValidationRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-black ${ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${ok ? "bg-emerald-600 text-white" : "bg-amber-400 text-slate-900"}`}>
        {ok ? "✓" : "!"}
      </span>
      <span>{label}</span>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  visible,
  onToggleVisibility,
  size,
  locale,
}: {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  size: "lg" | "xl";
  locale: Locale;
}) {
  const textSize = size === "xl" ? "text-xl" : "text-lg";
  const buttonLabel = visible
    ? locale === "it"
      ? "Nascondi password"
      : "Hide password"
    : locale === "it"
      ? "Mostra password"
      : "Show password";

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 pr-16 font-black text-slate-900 ${textSize}`}
      />
      <button
        type="button"
        className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        onClick={onToggleVisibility}
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.3A11.5 11.5 0 0 1 12 6c6.5 0 10 6 10 6a18.6 18.6 0 0 1-4.1 4.5" />
      <path d="M6.7 6.7C4.1 8.4 2 12 2 12s3.5 6 10 6c1.8 0 3.4-.4 4.8-1" />
      <path d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" />
    </svg>
  );
}

function StatusMessage({
  error,
  info,
  previewUrl,
  previewLabel,
}: {
  error: string;
  info: string;
  previewUrl: string | null;
  previewLabel: string;
}) {
  if (!error && !info && !previewUrl) return null;

  return (
    <div className="space-y-3">
      {error ? <p className="m-0 rounded-[20px] bg-rose-100 px-4 py-3 text-base font-black text-rose-900">{error}</p> : null}
      {info ? <p className="m-0 rounded-[20px] bg-emerald-100 px-4 py-3 text-base font-black text-emerald-900">{info}</p> : null}
      {previewUrl ? (
        <a href={previewUrl} className="inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-black text-white" target="_blank" rel="noreferrer">
          {previewLabel}
        </a>
      ) : null}
    </div>
  );
}
