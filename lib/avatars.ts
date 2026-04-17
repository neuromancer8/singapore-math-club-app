import type { AvatarId } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export interface AvatarOption {
  id: AvatarId;
  label: string;
  labelEn: string;
  symbol: string;
  gradient: string;
}

export const avatarOptions: AvatarOption[] = [
  { id: "rocket", label: "Razzo dei numeri", labelEn: "Number rocket", symbol: "🚀", gradient: "from-orange-300 via-amber-200 to-sky-300" },
  { id: "fox", label: "Volpe logica", labelEn: "Logic fox", symbol: "🦊", gradient: "from-orange-300 via-rose-200 to-amber-200" },
  { id: "owl", label: "Gufo saggio", labelEn: "Wise owl", symbol: "🦉", gradient: "from-cyan-200 via-blue-200 to-indigo-300" },
  { id: "robot", label: "Robot calcolatore", labelEn: "Calculator robot", symbol: "🤖", gradient: "from-slate-200 via-cyan-200 to-blue-300" },
  { id: "turtle", label: "Tartaruga costante", labelEn: "Steady turtle", symbol: "🐢", gradient: "from-emerald-200 via-lime-200 to-teal-300" },
  { id: "lion", label: "Leone coraggioso", labelEn: "Brave lion", symbol: "🦁", gradient: "from-yellow-200 via-orange-200 to-amber-300" },
  { id: "star", label: "Stella brillante", labelEn: "Bright star", symbol: "⭐", gradient: "from-yellow-100 via-amber-200 to-fuchsia-200" },
  { id: "planet", label: "Pianeta curioso", labelEn: "Curious planet", symbol: "🪐", gradient: "from-violet-200 via-fuchsia-200 to-cyan-200" },
  { id: "pencil", label: "Matita esploratrice", labelEn: "Explorer pencil", symbol: "✏️", gradient: "from-amber-200 via-yellow-100 to-lime-200" },
  { id: "whale", label: "Balena calma", labelEn: "Calm whale", symbol: "🐳", gradient: "from-sky-200 via-cyan-200 to-blue-300" },
  { id: "cat", label: "Gatto attento", labelEn: "Careful cat", symbol: "🐱", gradient: "from-rose-200 via-pink-100 to-orange-200" },
  { id: "unicorn", label: "Unicorno creativo", labelEn: "Creative unicorn", symbol: "🦄", gradient: "from-pink-200 via-violet-200 to-sky-200" },
];

export function getAvatarOption(id: AvatarId) {
  return avatarOptions.find((avatar) => avatar.id === id) ?? avatarOptions[0];
}

export function isAvatarId(value: unknown): value is AvatarId {
  return avatarOptions.some((avatar) => avatar.id === value);
}

export function avatarLabel(avatar: AvatarOption, locale: Locale) {
  return locale === "en" ? avatar.labelEn : avatar.label;
}
