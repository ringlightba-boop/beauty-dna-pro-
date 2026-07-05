import { NextRequest, NextResponse } from "next/server";
import { getDiagnosticById, updateDiagnostic } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth";
import type { DiagnosticResult } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const profile = getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const diagnostic = getDiagnosticById(params.id);
  if (!diagnostic || diagnostic.professional_id !== profile.id) {
    return NextResponse.json(
      { error: "Diagnóstico não encontrado." },
      { status: 404 }
    );
  }

  const body = (await req.json()) as {
    edited_result_json: DiagnosticResult;
    whatsapp_summary?: string;
  };

  const updated = updateDiagnostic(diagnostic.id, {
    edited_result_json: body.edited_result_json,
    whatsapp_summary:
      body.whatsapp_summary ?? body.edited_result_json.look_dna.resumo_whatsapp,
  });

  return NextResponse.json({ ok: true, diagnostic: updated });
}
