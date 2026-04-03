import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[30px] border border-white/55 bg-white/72 px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-6">
        <Link href="/" className="flex items-center gap-4">
          <div className="overflow-hidden rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
            <Image
              src="/logo-rotary.jpg"
              alt="Rotary Distretto 2041"
              width={170}
              height={66}
              className="h-auto w-[140px] md:w-[170px]"
              priority
            />
          </div>
          <div>
            <p className="section-title m-0 text-2xl font-black text-slate-900">Singapore Math Club</p>
            <p className="m-0 text-sm font-extrabold text-slate-600">Numeri, barre e strategie per la primaria</p>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2 text-sm font-extrabold text-slate-800">
          <Link href="/" className="pill bg-[var(--surface-soft)] shadow-sm">
            Home
          </Link>
          <Link href="/risultati" className="pill bg-white ring-1 ring-black/5 shadow-sm">
            Risultati
          </Link>
          <Link href="/genitori" className="pill bg-[var(--sky)] shadow-sm">
            Genitori
          </Link>
        </nav>
      </div>
    </header>
  );
}
