"use client";

import { useState } from "react";
import { RotateCcw, Save, FileDown } from "lucide-react";
import type { Client, Diagnostic, DiagnosticResult, Profile } from "@/lib/types";
import { CopyButton } from "@/components/painel/CopyButton";
import { generateDiagnosticPdf } from "@/lib/pdf";

function textareaFromList(list: string[]) {
  return list.join("\n");
}
function listFromTextarea(value: string) {
  return value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function DiagnosticoEditor({
  diagnostic,
  client,
  professional,
  subtitle,
}: {
  diagnostic: Diagnostic;
  client: Client | null;
  professional: Profile;
  subtitle: string;
}) {
  const initial = diagnostic.edited_result_json ?? diagnostic.result_json!;
  const [result, setResult] = useState<DiagnosticResult>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function updateMakeup<K extends keyof DiagnosticResult["makeup_dna"]>(
    key: K,
    value: DiagnosticResult["makeup_dna"][K]
  ) {
    setResult((r) => ({ ...r, makeup_dna: { ...r.makeup_dna, [key]: value } }));
  }
  function updateHair<K extends keyof NonNullable<DiagnosticResult["hair_dna"]>>(
    key: K,
    value: NonNullable<DiagnosticResult["hair_dna"]>[K]
  ) {
    setResult((r) => (r.hair_dna ? { ...r, hair_dna: { ...r.hair_dna, [key]: value } } : r));
  }
  function updateLook<K extends keyof DiagnosticResult["look_dna"]>(
    key: K,
    value: DiagnosticResult["look_dna"][K]
  ) {
    setResult((r) => ({ ...r, look_dna: { ...r.look_dna, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/diagnostics/${diagnostic.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          edited_result_json: result,
          whatsapp_summary: result.look_dna.resumo_whatsapp,
        }),
      });
      if (res.ok) {
        setSavedAt(new Date().toLocaleTimeString("pt-BR"));
      }
    } finally {
      setSaving(false);
    }
  }

  function handleRestore() {
    if (diagnostic.result_json) setResult(diagnostic.result_json);
  }

  function handlePdf() {
    generateDiagnosticPdf({ diagnostic, client, professional, result });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Relatório</p>
          <h1 className="mt-1 text-2xl">{client?.name ?? "Cliente"}</h1>
          <p className="mt-1 text-sm text-graphite/50">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleRestore} className="btn-secondary !px-4 !py-2 text-xs">
            <RotateCcw size={14} /> Restaurar original
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-secondary !px-4 !py-2 text-xs">
            <Save size={14} /> {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          <button onClick={handlePdf} className="btn-primary !px-4 !py-2 text-xs">
            <FileDown size={14} /> Gerar PDF
          </button>
        </div>
      </div>
      {savedAt && (
        <p className="mt-2 text-xs text-brown-deep">Alterações salvas às {savedAt}.</p>
      )}

      {/* Dados da cliente */}
      <Section title="Dados da cliente e atendimento">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <InfoItem label="WhatsApp" value={client?.whatsapp} />
          <InfoItem label="Idade" value={client?.age?.toString()} />
          <InfoItem label="Cidade" value={client?.city} />
          <InfoItem label="Instagram" value={client?.instagram} />
          <InfoItem label="Ocasião" value={diagnostic.occasion ?? undefined} />
          <InfoItem label="Imagem desejada" value={diagnostic.desired_image ?? undefined} />
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          <PhotoThumb src={diagnostic.photo_front_url} label="Frente" />
          <PhotoThumb src={diagnostic.photo_side_url} label="Lateral" />
          <PhotoThumb src={diagnostic.makeup_reference_url} label="Ref. maquiagem" />
          <PhotoThumb src={diagnostic.hair_reference_url} label="Ref. penteado" />
          <PhotoThumb src={diagnostic.outfit_reference_url} label="Look/vestido" />
        </div>
      </Section>

      {/* Makeup DNA */}
      <Section title="Makeup DNA" tag={result.makeup_dna.codigo}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Código" value={result.makeup_dna.codigo} onChange={(v) => updateMakeup("codigo", v)} />
          <TextField label="Temperatura (tendência)" value={result.makeup_dna.temperatura_provavel} onChange={(v) => updateMakeup("temperatura_provavel", v)} />
          <TextField label="Contraste" value={result.makeup_dna.contraste} onChange={(v) => updateMakeup("contraste", v)} />
          <TextField label="Intensidade" value={result.makeup_dna.intensidade} onChange={(v) => updateMakeup("intensidade", v)} />
          <TextField label="Acabamento ideal" value={result.makeup_dna.acabamento_ideal} onChange={(v) => updateMakeup("acabamento_ideal", v)} />
          <TextField label="Cobertura recomendada" value={result.makeup_dna.cobertura_recomendada} onChange={(v) => updateMakeup("cobertura_recomendada", v)} />
          <TextField label="Subtom de base (provável)" value={result.makeup_dna.subtom_base_provavel} onChange={(v) => updateMakeup("subtom_base_provavel", v)} />
          <TextField label="Tipo de pele" value={result.makeup_dna.tipo_pele} onChange={(v) => updateMakeup("tipo_pele", v)} />
        </div>
        <ListField label="Blush recomendado (um por linha)" value={result.makeup_dna.blush_recomendado} onChange={(v) => updateMakeup("blush_recomendado", v)} />
        <ListField label="Batons recomendados (um por linha)" value={result.makeup_dna.batons_recomendados} onChange={(v) => updateMakeup("batons_recomendados", v)} />
        <ListField label="Sombras recomendadas (uma por linha)" value={result.makeup_dna.sombras_recomendadas} onChange={(v) => updateMakeup("sombras_recomendadas", v)} />
        <ListField label="Cores a evitar (uma por linha)" value={result.makeup_dna.cores_a_evitar} onChange={(v) => updateMakeup("cores_a_evitar", v)} />
        <TextAreaField label="Make assinatura" value={result.makeup_dna.make_assinatura} onChange={(v) => updateMakeup("make_assinatura", v)} />
      </Section>

      {/* Hair DNA */}
      {result.hair_dna && (
        <Section title="Hair DNA" tag={result.hair_dna.codigo}>
          <TextField label="Código" value={result.hair_dna.codigo} onChange={(v) => updateHair("codigo", v)} />
          <ListField label="Penteados indicados (um por linha)" value={result.hair_dna.penteados_indicados} onChange={(v) => updateHair("penteados_indicados", v)} />
          <ListField label="Penteados a evitar (um por linha)" value={result.hair_dna.penteados_a_evitar} onChange={(v) => updateHair("penteados_a_evitar", v)} />
        </Section>
      )}

      {/* Look DNA */}
      <Section title="Look DNA" tag={result.look_dna.codigo}>
        <TextField label="Código" value={result.look_dna.codigo} onChange={(v) => updateLook("codigo", v)} />
        <TextAreaField label="Resumo executivo" value={result.look_dna.resumo_executivo} onChange={(v) => updateLook("resumo_executivo", v)} />
        <ListField label="O que valoriza (um por linha)" value={result.look_dna.o_que_valoriza} onChange={(v) => updateLook("o_que_valoriza", v)} />
        <ListField label="O que evitar (um por linha)" value={result.look_dna.o_que_evitar} onChange={(v) => updateLook("o_que_evitar", v)} />
        <ListField label="Checklist de execução (um por linha)" value={result.look_dna.checklist_execucao} onChange={(v) => updateLook("checklist_execucao", v)} />
      </Section>

      {/* Resumo WhatsApp */}
      <Section title="Resumo para WhatsApp">
        <textarea
          className="input-field min-h-[120px]"
          value={result.look_dna.resumo_whatsapp}
          onChange={(e) => updateLook("resumo_whatsapp", e.target.value)}
        />
        <div className="mt-3">
          <CopyButton text={result.look_dna.resumo_whatsapp} label="Copiar resumo" />
        </div>
      </Section>

      <p className="mb-10 mt-6 text-xs text-graphite/45">
        Diagnóstico estético e orientativo. Não substitui avaliação
        dermatológica nem identifica personalidade a partir da foto — a foto
        é usada apenas como apoio visual.
      </p>
    </div>
  );
}

function Section({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card mt-6 p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg italic text-ink">{title}</p>
        {tag && <span className="rounded-full bg-ivory-deep px-3 py-1 text-xs text-brown-deep">{tag}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-graphite/45">{label}</p>
      <p className="text-ink">{value || "—"}</p>
    </div>
  );
}

function PhotoThumb({ src, label }: { src: string | null; label: string }) {
  if (!src) return null;
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-24 w-24 rounded-xl object-cover shadow-card" />
      <p className="mt-1 text-center text-[10px] text-graphite/50">{label}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-graphite/60">{label}</span>
      <input className="input-field" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-graphite/60">{label}</span>
      <textarea
        className="input-field min-h-[80px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-graphite/60">{label}</span>
      <textarea
        className="input-field min-h-[70px]"
        value={textareaFromList(value)}
        onChange={(e) => onChange(listFromTextarea(e.target.value))}
      />
    </label>
  );
}
