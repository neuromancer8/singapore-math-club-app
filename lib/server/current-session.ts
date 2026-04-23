import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/server/auth-cookie";
import { readSession } from "@/lib/server/auth-store";

export async function getCurrentSession(options: { refresh?: boolean } = {}) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";

  return readSession(sessionId, options);
}
