import { NextRequest, NextResponse } from "next/server";
import {
  adjustCredits,
  getDiagnosticById,
  getProfileById,
  updateDiagnostic,
} from "@/lib/db";
import { generateDiagnosticResult, wantsHair } from "@/lib/diagnostic-engine";
import type { DiagnosticAnswers, ServiceType } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const diagnostic = await getDiagnosticById(params.id);
  if (!diagnostic) {
    return NextResponse.json(
      { error: "Diagnóstico não encontrado." },
      { status: 404 }
    );
  }

  const profile = await getProfileById(diagnostic.professional_id);
  if (!profile) {
    return NextResponse.json(
      { error: "Profissional não encontrada." },
      { status: 404 }
    );
  }

  const body = await req.json();
  const {
    servico,
    ocasiao,
    imagem_desejada,
    photos,
    makeupAnswers,
    hairAnswers,
  } = body ?? {};

  if (!servico || !ocasiao || !imagem_desejada) {
    return NextResponse.json(
      { error: "Responda todas as perguntas da etapa de atendimento." },
      { status: 400 }
    );
  }

  if (!photos?.front) {
    return NextResponse.json(
      { error: "A foto de frente é obrigatória." },
      { status: 400 }
    );
  }

  const isUnlimited = profile.plan_type === "unlimited" && profile.plan_status === "active";
  if (!isUnlimited && profile.credits_available <= 0) {
    // Preserve the answers so the professional can see this as a pending
    // client once she tops up credits, instead of losing the submission.
    await updateDiagnostic(diagnostic.id, {
      service_type: servico as ServiceType,
      occasion: ocasiao,
      desired_image: imagem_desejada,
      photo_front_url: photos.front,
      photo_side_url: photos.side ?? null,
      makeup_reference_url: photos.makeupRef ?? null,
      hair_reference_url: photos.hairRef ?? null,
      outfit_reference_url: photos.outfitRef ?? null,
      answers_json: {
        servico,
        ocasiao,
        imagem_desejada,
        makeup: makeupAnswers,
        hair: wantsHair(servico) ? hairAnswers : undefined,
      },
    });
    return NextResponse.json(
      {
        error:
          "SEM_CREDITOS",
        message:
          "Sua profissional está sem créditos disponíveis no momento. Suas respostas foram salvas e ela poderá finalizar seu diagnóstico assim que renovar os créditos.",
      },
      { status: 402 }
    );
  }

  const answers: DiagnosticAnswers = {
    servico,
    ocasiao,
    imagem_desejada,
    makeup: makeupAnswers,
    hair: wantsHair(servico) ? hairAnswers : undefined,
  };

  const result = generateDiagnosticResult(answers);

  const updated = await updateDiagnostic(diagnostic.id, {
    status: "concluido",
    service_type: servico as ServiceType,
    occasion: ocasiao,
    desired_image: imagem_desejada,
    photo_front_url: photos.front,
    photo_side_url: photos.side ?? null,
    makeup_reference_url: photos.makeupRef ?? null,
    hair_reference_url: photos.hairRef ?? null,
    outfit_reference_url: photos.outfitRef ?? null,
    answers_json: answers,
    result_json: result,
    edited_result_json: result,
    whatsapp_summary: result.look_dna.resumo_whatsapp,
  });

  await adjustCredits(
    profile.id,
    -1,
    "consume",
    "Diagnóstico concluído",
    diagnostic.id
  );

  return NextResponse.json({ ok: true, diagnosticId: updated?.id });
}
