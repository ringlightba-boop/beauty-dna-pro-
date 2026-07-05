import { NextRequest, NextResponse } from "next/server";
import { createClient, createDiagnostic, getProfileBySlug } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, consent, client } = body ?? {};

  if (!consent) {
    return NextResponse.json(
      { error: "É necessário aceitar o termo de consentimento." },
      { status: 400 }
    );
  }

  if (!client?.name || !client?.whatsapp) {
    return NextResponse.json(
      { error: "Nome e WhatsApp são obrigatórios." },
      { status: 400 }
    );
  }

  const profile = getProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json(
      { error: "Link inválido. Verifique o link com sua profissional." },
      { status: 404 }
    );
  }

  const clientRecord = createClient({
    professional_id: profile.id,
    name: client.name,
    whatsapp: client.whatsapp,
    email: client.email || undefined,
    age: client.age ? Number(client.age) : undefined,
    city: client.city || undefined,
    instagram: client.instagram || undefined,
  });

  const diagnostic = createDiagnostic({
    professional_id: profile.id,
    client_id: clientRecord.id,
    status: "aguardando_cliente",
    service_type: null,
    occasion: null,
    desired_image: null,
    appointment_date: null,
    consent_accepted: true,
    photo_front_url: null,
    photo_side_url: null,
    makeup_reference_url: null,
    hair_reference_url: null,
    outfit_reference_url: null,
    answers_json: null,
    result_json: null,
    edited_result_json: null,
    whatsapp_summary: null,
    pdf_url: null,
  });

  return NextResponse.json({ diagnosticId: diagnostic.id });
}
