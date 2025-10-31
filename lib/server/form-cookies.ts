"use server";

import { cookies } from "next/headers";
import { UI_KEY, FORM_KEY } from "@/constants"

export async function readJsonCookie<T>(key: string): Promise<T | null> {
  const v = cookies().get(key)?.value;
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export async function writeJsonCookie(
  key: string,
  value: unknown,
  maxAgeDays = 7
): Promise<void> {
  (await cookies()).set({
    name: key,
    value: JSON.stringify(value),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeDays * 24 * 60 * 60,
  });
}

export async function clearCookie(key: string): Promise<void> {
  (await cookies()).set({ name: key, value: "", maxAge: 0, path: "/" });
}
