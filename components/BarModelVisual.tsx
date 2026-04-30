import type { Locale } from "@/lib/i18n";

export function BarModelVisual({
  prompt,
  visualModel,
  locale,
}: {
  prompt: string;
  visualModel?: string;
  locale: Locale;
}) {
  const model = buildModel(`${prompt} ${visualModel ?? ""}`);
  const knownPercent = Math.max(18, Math.min(78, Math.round((model.known / model.total) * 100)));
  const unknownPercent = 100 - knownPercent;

  return (
    <div className="mt-4 rounded-[26px] border border-orange-100 bg-orange-50/70 p-4">
      <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-orange-600">
        {locale === "it" ? "Bar model visivo" : "Visual bar model"}
      </p>
      <div className="mt-4 overflow-hidden rounded-[20px] border-4 border-white bg-white shadow-sm">
        <div className="flex h-16 w-full">
          <div
            className="flex items-center justify-center bg-orange-400 px-2 text-base font-black text-white"
            style={{ width: `${knownPercent}%` }}
          >
            {model.known}
          </div>
          <div
            className="flex items-center justify-center border-l-4 border-dashed border-slate-400 bg-slate-100 px-2 text-base font-black text-slate-700"
            style={{ width: `${unknownPercent}%` }}
          >
            ?
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm font-black text-slate-700">
        <span>
          {locale === "it" ? "Parte nota" : "Known part"}: {model.known}
        </span>
        <span>
          {locale === "it" ? "Totale" : "Total"}: {model.total}
        </span>
      </div>
      {visualModel ? <p className="mt-3 mb-0 text-sm font-bold leading-6 text-slate-600">{visualModel}</p> : null}
    </div>
  );
}

export function ConcreteDotsVisual({
  options,
  locale,
}: {
  options?: string[];
  locale: Locale;
}) {
  const numericOptions = options
    ?.map((option) => Number.parseInt(option, 10))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 80)
    .slice(0, 4);

  if (!numericOptions || numericOptions.length < 2) return null;

  return (
    <div className="mt-4 rounded-[26px] border border-cyan-100 bg-cyan-50/70 p-4">
      <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-cyan-700">
        {locale === "it" ? "Rappresentazione concreta" : "Concrete representation"}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {numericOptions.map((value) => (
          <div key={value} className="rounded-[20px] bg-white p-3 shadow-sm">
            <p className="m-0 text-base font-black text-slate-900">{value}</p>
            <PlaceValueBlocks value={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceValueBlocks({ value }: { value: number }) {
  const tens = Math.floor(value / 10);
  const ones = value % 10;

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2" aria-hidden="true">
      {Array.from({ length: tens }).map((_, index) => (
        <span key={`ten-${index}`} className="h-9 w-3 rounded-full bg-orange-400" />
      ))}
      {Array.from({ length: ones }).map((_, index) => (
        <span key={`one-${index}`} className="h-3 w-3 rounded-full bg-cyan-500" />
      ))}
    </div>
  );
}

function buildModel(text: string) {
  const numbers = Array.from(text.matchAll(/\d+/g))
    .map((match) => Number.parseInt(match[0], 10))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (numbers.length < 2) {
    return { known: 18, total: 50 };
  }

  const total = Math.max(...numbers);
  const known = numbers.find((value) => value < total) ?? Math.max(1, Math.round(total * 0.45));

  return { known, total };
}
