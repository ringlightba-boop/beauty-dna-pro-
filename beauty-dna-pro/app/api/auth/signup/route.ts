import { NextRequest, NextResponse } from "next/server";
import { createProfile, getProfileByEmail, slugExists } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    full_name,
    professional_name,
    email,
    whatsapp,
    city,
    state,
    instagram,
    password,
  } = body ?? {};

  if (!full_name || !professional_name || !email || !whatsapp || !city || !state || !password) {
    return NextResponse.json(
      { error: "Preencha todos os campos obrigatórios." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 }
    );
  }

  if (await getProfileByEmail(email)) {
    return NextResponse.json(
      { error: "Já existe uma conta com este e-mail." },
      { status: 409 }
    );
  }

  let baseSlug = slugify(professional_name) || slugify(full_name) || "maquiadora";
  let slug = baseSlug;
  let attempt = 1;
  while (await slugExists(slug)) {
    attempt += 1;
    slug = `${baseSlug}${attempt}`;
  }

  const password_hash = await hashPassword(password);

  const profile = await createProfile({
    full_name,
    professional_name,
    email,
    password_hash,
    whatsapp,
    city,
    state,
    instagram: instagram || "",
    slug,
  });

  setSessionCookie(profile.id);

  return NextResponse.json({ ok: true, slug: profile.slug });
}
