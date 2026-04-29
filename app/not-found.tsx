import Link from "next/link";
import { getServerLocale } from "@/lib/server-locale";

export default async function NotFound() {
  const locale = await getServerLocale();

  return (
    <div className="card overflow-hidden p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="pill bg-[var(--surface-soft)] text-slate-900">404</span>
          <h1 className="section-title mt-4 text-4xl font-black text-slate-900 md:text-5xl">
            {locale === "it" ? "Pagina non trovata" : "Page not found"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-slate-600">
            {locale === "it"
              ? "Il link che hai aperto non corrisponde a una pagina disponibile. Torniamo alla home e ripartiamo da un percorso valido."
              : "The link you opened does not match an available page. Let's return to the home page and restart from a valid path."}
          </p>
          <div className="mt-6">
            <Link href="/" className="cta-primary">
              {locale === "it" ? "Torna alla home" : "Back to home"}
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <div className="soft-card w-full p-6 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] bg-white text-6xl shadow-sm">
              🧭
            </div>
            <p className="mt-5 mb-0 text-xl font-black text-slate-900">{locale === "it" ? "Percorso interrotto" : "Path interrupted"}</p>
            <p className="mt-3 mb-0 text-base font-bold leading-7 text-slate-600">
              {locale === "it"
                ? "Scegli una classe, un argomento oppure torna alla dashboard per continuare senza errori."
                : "Choose a class, a topic, or go back to the dashboard to continue without errors."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
