import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { updateProfile } from "@/lib/db";

const ALLOWED_FIELDS = [
  "professional_name",
  "whatsapp",
  "city",
  "state",
  "instagram",
  "brand_name",
  "brand_color",
  "default_message",
] as const;

export async function PATCH(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const body = await req.json();
  const patch: Record<string, string> = {};
  for (const field of ALLOWED_FIELDS) {
    if (typeof body[field] === "string") patch[field] = body[field];
  }

  const updated = await updateProfile(profile.id, patch);
  return NextResponse.json({ ok: true, profile: updated });
}
