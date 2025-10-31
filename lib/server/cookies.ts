// lib/ssr/cookies.ts
import { cookies } from "next/headers";

export const UI_KEY = "sp_quote_ui";
export const WIP_KEY = "sp_quote_wip";

export async function getJsonCookie<T>(key: string): Promise<T | null> {
  const c = (await cookies()).get(key)?.value;
  if (!c) return null;
  try { return JSON.parse(c) as T; } catch { return null; }
}

export async function setJsonCookie(key: string, value: unknown, opts: Partial<Parameters<typeof cookies>["0"]> = {}) {
  (await cookies()).set({
    name: key,
    value: JSON.stringify(value),
    path: "/",
    httpOnly: false, // biar bisa diinspeksi saat eksperimen; set true kalau mau hidden
    sameSite: "lax",
    ...opts,
  });
}

export async function clearCookie(key: string) {
  (await cookies()).set({ name: key, value: "", path: "/", maxAge: 0 });
}

// Helpers khusus UI/WIP
export type UIFlowState = { mode: "new" | "existing"; selectedExistingQuoteId?: string };

export const getUI = () => getJsonCookie<UIFlowState>(UI_KEY);
export const setUI = (ui: UIFlowState) => setJsonCookie(UI_KEY, ui);

export const getWip = <T,>() => getJsonCookie<T>(WIP_KEY);
export const setWip = (wip: unknown) => setJsonCookie(WIP_KEY, wip);
export const clearWip = () => clearCookie(WIP_KEY);
