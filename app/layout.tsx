import type { Metadata } from "next";
import "./globals.css";
import { AuthGate } from "@/components/AuthGate";
import { Header } from "@/components/Header";
import { getServerLocale } from "@/lib/server-locale";

export const metadata: Metadata = {
  title: "Singapore Math Club",
  description: "Primary school Singapore Math practice app with visual reasoning and bar models.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const footerText =
    locale === "it"
      ? {
          title: "Singapore Math Club",
          subtitle: "Rotary Distretto 2041",
          description: "I progressi didattici sono salvati localmente nel browser. Per l'accesso genitore vengono usati solo i servizi necessari dell'app.",
          contact: "Informativa privacy e termini sono disponibili qui sotto.",
        }
      : {
          title: "Singapore Math Club",
          subtitle: "Rotary District 2041",
          description: "Learning progress is stored locally in the browser. Only the app services needed for parent access are used.",
          contact: "Privacy information and terms are available below.",
        };

  return (
    <html lang={locale}>
      <body>
        <AuthGate>
          <Header />
          <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
          <footer className="mx-auto mt-4 w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-white/55 bg-white/72 px-5 py-5 text-sm font-bold text-slate-600 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="m-0 font-black text-slate-900">{footerText.title}</p>
                  <p className="mt-1 mb-0 text-sm font-extrabold text-slate-500">{footerText.subtitle}</p>
                  <p className="mt-2 mb-0 leading-6">
                    {footerText.description}
                  </p>
                  <p className="mt-2 mb-0 leading-6">
                    {footerText.contact}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-slate-700">
                  <a href="/privacy" className="underline underline-offset-4">Privacy Policy</a>
                  <a href="/termini" className="underline underline-offset-4">{locale === "it" ? "Termini di servizio" : "Terms of service"}</a>
                </div>
              </div>
            </div>
          </footer>
        </AuthGate>
      </body>
    </html>
  );
}
