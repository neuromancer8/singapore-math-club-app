import { cookies } from "next/headers";
import { defaultLocale, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_STORAGE_KEY)?.value;

  return locale === "en" || locale === "it" ? locale : defaultLocale;
}
