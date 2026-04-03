import type { Metadata } from "next";
import "./globals.css";
import { AuthGate } from "@/components/AuthGate";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Singapore Math Club",
  description: "MVP per la primaria italiana con percorsi di Singapore Math.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <AuthGate>
          <Header />
          <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
        </AuthGate>
      </body>
    </html>
  );
}
