import type { Locale } from "@/lib/i18n";

export function formatCount(
  count: number,
  locale: Locale,
  labels: {
    it: { singular: string; plural: string };
    en: { singular: string; plural: string };
  },
) {
  const dictionary = labels[locale];
  return `${count} ${count === 1 ? dictionary.singular : dictionary.plural}`;
}
