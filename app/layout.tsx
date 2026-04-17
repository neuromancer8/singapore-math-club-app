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

  return (
    <html lang={locale}>
      <body>
        <AuthGate>
          <Header />
          <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
        </AuthGate>
      </body>
    </html>
  );
}
