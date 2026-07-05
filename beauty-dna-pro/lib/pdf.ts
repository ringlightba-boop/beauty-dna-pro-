import { jsPDF } from "jspdf";
import type { Client, Diagnostic, DiagnosticResult, Profile } from "./types";
import { formatDate, serviceLabel } from "./utils";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function newCursor() {
  return { y: MARGIN };
}

function ensureSpace(doc: jsPDF, cursor: { y: number }, needed: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursor.y + needed > pageHeight - MARGIN) {
    doc.addPage();
    cursor.y = MARGIN;
  }
}

function heading(doc: jsPDF, cursor: { y: number }, text: string) {
  ensureSpace(doc, cursor, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor("#211B17");
  doc.text(text, MARGIN, cursor.y);
  cursor.y += 3;
  doc.setDrawColor("#AD8A52");
  doc.setLineWidth(0.6);
  doc.line(MARGIN, cursor.y, MARGIN + 22, cursor.y);
  cursor.y += 7;
}

function paragraph(doc: jsPDF, cursor: { y: number }, text: string) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor("#3A332F");
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  ensureSpace(doc, cursor, lines.length * 5 + 4);
  doc.text(lines, MARGIN, cursor.y);
  cursor.y += lines.length * 5 + 4;
}

function bulletList(doc: jsPDF, cursor: { y: number }, items: string[]) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor("#3A332F");
  items.forEach((item) => {
    const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH - 4);
    ensureSpace(doc, cursor, lines.length * 5 + 2);
    doc.text(lines, MARGIN + 2, cursor.y);
    cursor.y += lines.length * 5 + 2;
  });
  cursor.y += 3;
}

function labelValue(doc: jsPDF, cursor: { y: number }, label: string, value: string) {
  ensureSpace(doc, cursor, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor("#6B4E3D");
  doc.text(`${label}:`, MARGIN, cursor.y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#211B17");
  doc.text(value, MARGIN + 38, cursor.y);
  cursor.y += 6;
}

export function generateDiagnosticPdf({
  diagnostic,
  client,
  professional,
  result,
}: {
  diagnostic: Diagnostic;
  client: Client | null;
  professional: Profile;
  result: DiagnosticResult;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cursor = newCursor();

  // --- Capa -----------------------------------------------------------
  doc.setFillColor("#FBF6F0");
  doc.rect(0, 0, PAGE_WIDTH, doc.internal.pageSize.getHeight(), "F");
  doc.setDrawColor("#AD8A52");
  doc.setLineWidth(1);
  doc.line(MARGIN, 70, MARGIN + 40, 70);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor("#6B4E3D");
  doc.text("Beauty DNA Pro AI", MARGIN, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor("#211B17");
  doc.text("Look DNA Report", MARGIN, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor("#3A332F");
  doc.text(result.look_dna.codigo, MARGIN, 95);
  doc.setFontSize(10);
  doc.setTextColor("#6B4E3D");
  doc.text(`Preparado por ${professional.professional_name}`, MARGIN, 110);
  doc.text(`Cliente: ${client?.name ?? "—"}`, MARGIN, 116);
  doc.text(`Data: ${formatDate(diagnostic.created_at)}`, MARGIN, 122);

  doc.addPage();
  cursor.y = MARGIN;

  // --- Dados da cliente -------------------------------------------------
  heading(doc, cursor, "Dados da cliente");
  labelValue(doc, cursor, "Nome", client?.name ?? "—");
  labelValue(doc, cursor, "WhatsApp", client?.whatsapp ?? "—");
  labelValue(doc, cursor, "Cidade", client?.city ?? "—");
  labelValue(doc, cursor, "Serviço", serviceLabel(diagnostic.service_type));
  labelValue(doc, cursor, "Ocasião", diagnostic.occasion ?? "—");
  labelValue(doc, cursor, "Imagem desejada", diagnostic.desired_image ?? "—");
  cursor.y += 4;

  // --- Resumo executivo ---------------------------------------------------
  heading(doc, cursor, "Resumo executivo");
  paragraph(doc, cursor, result.look_dna.resumo_executivo);

  // --- Makeup DNA -------------------------------------------------------
  heading(doc, cursor, "Makeup DNA");
  labelValue(doc, cursor, "Código", result.makeup_dna.codigo);
  labelValue(doc, cursor, "Temperatura", result.makeup_dna.temperatura_provavel);
  labelValue(doc, cursor, "Contraste", result.makeup_dna.contraste);
  labelValue(doc, cursor, "Intensidade", result.makeup_dna.intensidade);
  labelValue(doc, cursor, "Acabamento ideal", result.makeup_dna.acabamento_ideal);
  labelValue(doc, cursor, "Cobertura", result.makeup_dna.cobertura_recomendada);
  labelValue(doc, cursor, "Subtom provável", result.makeup_dna.subtom_base_provavel);
  cursor.y += 2;
  paragraph(doc, cursor, result.makeup_dna.make_assinatura);
  bulletList(doc, cursor, [
    `Blush: ${result.makeup_dna.blush_recomendado.join(", ")}`,
    `Batom: ${result.makeup_dna.batons_recomendados.join(", ")}`,
    `Sombra: ${result.makeup_dna.sombras_recomendadas.join(", ")}`,
    `Evitar: ${result.makeup_dna.cores_a_evitar.join(", ")}`,
  ]);

  // --- Hair DNA -----------------------------------------------------------
  if (result.hair_dna) {
    heading(doc, cursor, "Hair DNA");
    labelValue(doc, cursor, "Código", result.hair_dna.codigo);
    cursor.y += 2;
    bulletList(doc, cursor, result.hair_dna.penteados_indicados.map((p) => `Indicado: ${p}`));
    bulletList(doc, cursor, result.hair_dna.penteados_a_evitar.map((p) => `Evitar: ${p}`));
  }

  // --- Look DNA -----------------------------------------------------------
  heading(doc, cursor, "Look DNA");
  labelValue(doc, cursor, "Código", result.look_dna.codigo);
  cursor.y += 2;

  heading(doc, cursor, "O que valoriza");
  bulletList(doc, cursor, result.look_dna.o_que_valoriza);

  heading(doc, cursor, "O que evitar");
  bulletList(doc, cursor, result.look_dna.o_que_evitar);

  heading(doc, cursor, "Checklist de execução");
  bulletList(doc, cursor, result.look_dna.checklist_execucao);

  // --- Mensagem final -----------------------------------------------------
  heading(doc, cursor, "Mensagem final");
  paragraph(
    doc,
    cursor,
    "Este diagnóstico é estético e orientativo. Ele não substitui a avaliação presencial da profissional e pode ser ajustado no dia do atendimento conforme a preferência da cliente."
  );

  doc.save(`look-dna-${(client?.name ?? "cliente").toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
