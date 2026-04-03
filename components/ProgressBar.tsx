export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-extrabold text-slate-700">
        <span>
          Esercizio {current} di {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[var(--secondary)] transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
