export function BadgePanel({ badges }: { badges: string[] }) {
  return (
    <div className="rounded-[28px] border border-white/50 bg-white/80 p-5 shadow-[0_18px_60px_rgba(76,29,149,0.12)] backdrop-blur">
      <h3 className="m-0 text-xl font-black text-slate-900">Badge sbloccati</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {badges.length > 0 ? (
          badges.map((badge) => (
            <span key={badge} className="pill bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 text-white shadow-sm">
              {badge}
            </span>
          ))
        ) : (
          <p className="m-0 text-base font-bold text-slate-700">Continua a giocare per sbloccare i primi badge.</p>
        )}
      </div>
    </div>
  );
}
