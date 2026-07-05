import { NextRequest, NextResponse } from "next/server";
import { getProfileByEmail } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Informe e-mail e senha." },
      { status: 400 }
    );
  }

  const profile = await getProfileByEmail(email);
  if (!profile) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos." },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, profile.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos." },
      { status: 401 }
    );
  }

  setSessionCookie(profile.id);
  return NextResponse.json({ ok: true });
}
