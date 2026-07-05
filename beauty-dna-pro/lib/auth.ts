import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getProfileById } from "./db";
import type { Profile } from "./types";

const SESSION_COOKIE = "bdp_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setSessionCookie(professionalId: string) {
  cookies().set(SESSION_COOKIE, professionalId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export function getSessionProfileId(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}

export function getCurrentProfile(): Profile | null {
  const id = getSessionProfileId();
  if (!id) return null;
  return getProfileById(id) ?? null;
}
