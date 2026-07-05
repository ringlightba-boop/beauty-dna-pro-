"use client";

import { useMemo, useState } from "react";
import { Sparkles, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { SwatchProgress } from "@/components/ui/SwatchProgress";
import { ChoicePill } from "@/components/ui/ChoicePill";
import { QuestionRenderer } from "@/components/cliente/QuestionRenderer";
import { PhotoUploadField } from "@/components/cliente/PhotoUploadField";
import { StyleOptionPicker } from "@/components/cliente/StyleOptionPicker";
import { buildStyleOptions, type StyleOption } from "@/lib/diagnostic-engine";
import {
  servicoOpcoes,
  ocasiaoOpcoes,
  imagemDesejadaOpcoes,
  makeupDnaPerguntas,
  hairDnaPerguntas,
} from "@/lib/questions";

const CONSENT_TEXT =
  "Sua foto e respostas serão usadas apenas para gerar seu diagnóstico de beleza e ajudar sua profissional no atendimento. Não usamos sua imagem para reconhecimento facial biométrico, identificação pessoal automatizada ou venda de dados. Você poderá solicitar a exclusão dos seus dados a qualquer momento.";

type Phase =
  | "consent"
  | "flow"
  | "finalizando"
  | "concluido"
  | "sem_creditos"
  | "erro";

type FlowStepBase = { key: string; kind: string };
type FlowStep =
  | (FlowStepBase & { kind: "dados" })
  | (FlowStepBase & { kind: "servico" })
  | (FlowStepBase & { kind: "ocasiao" })
  | (FlowStepBase & { kind: "imagem" })
  | (FlowStepBase & { kind: "fotos" })
  | (FlowStepBase & { kind: "makeup"; questionIndex: number })
  | (FlowStepBase & { kind: "hair"; questionIndex: number })
  | (FlowStepBase & { kind: "estilo" });

function buildSteps(includeHair: boolean): FlowStep[] {
  const steps: FlowStep[] = [
    { key: "dados", kind: "dados" },
    { key: "servico", kind: "servico" },
    { key: "ocasiao", kind: "ocasiao" },
    { key: "imagem", kind: "imagem" },
    { key: "fotos", kind: "fotos" },
  ];
  makeupDnaPerguntas.forEach((_, i) =>
    steps.push({ key: `makeup-${i}`, kind: "makeup", questionIndex: i })
  );
  if (includeHair) {
    hairDnaPerguntas.forEach((_, i) =>
      steps.push({ key: `hair-${i}`, kind: "hair", questionIndex: i })
    );
  }
  steps.push({ key: "estilo", kind: "estilo" });
  return steps;
}

interface ClientData {
  name: string;
  whatsapp: string;
  email: string;
  age: string;
  city: string;
  instagram: string;
}

interface Photos {
  front: string | null;
  side: string | null;
  makeupRef: string | null;
  hairRef: string | null;
  outfitRef: string | null;
}

export function ClienteWizard({
  slug,
  professionalName,
}: {
  slug: string;
  professionalName: string;
}) {
  const [phase, setPhase] = useState<Phase>("consent");
  const [consentChecked, setConsentChecked] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [clientData, setClientData] = useState<ClientData>({
    name: "",
    whatsapp: "",
    email: "",
    age: "",
    city: "",
    instagram: "",
  });
  const [servico, setServico] = useState<string>("");
  const [ocasiao, setOcasiao] = useState<string>("");
  const [imagemDesejada, setImagemDesejada] = useState<string>("");
  const [photos, setPhotos] = useState<Photos>({
    front: null,
    side: null,
    makeupRef: null,
    hairRef: null,
    outfitRef: null,
  });
  const [makeupAnswers, setMakeupAnswers] = useState<Record<string, string>>({});
  const [hairAnswers, setHairAnswers] = useState<Record<string, string>>({});
  const [selectedStyle, setSelectedStyle] = useState<StyleOption["key"] | null>(null);
  const [startingClient, setStartingClient] = useState(false);

  const includeHair = servico === "penteado" || servico === "maquiagem_penteado";
  const steps = useMemo(() => buildSteps(includeHair), [includeHair]);
  const step = steps[stepIndex];
  const progressPercent = (stepIndex / (steps.length - 1)) * 100;

  const styleOptions = useMemo(
    () => buildStyleOptions(imagemDesejada, makeupAnswers),
    [imagemDesejada, makeupAnswers]
  );

  function canAdvance(): boolean {
    if (!step) return false;
    switch (step.kind) {
      case "dados":
        return clientData.name.trim().length > 1 && clientData.whatsapp.trim().length > 7;
      case "servico":
        return !!servico;
      case "ocasiao":
        return !!ocasiao;
      case "imagem":
        return !!imagemDesejada;
      case "fotos":
        return !!photos.front;
      case "makeup":
        return true; // last field (m20) is open text/optional; others are gently required via UI nudge
      case "hair":
        return true;
      case "estilo":
        return !!selectedStyle;
      default:
        return true;
    }
  }

  async function handleNext() {
    if (!step) return;

    if (step.kind === "dados") {
      setStartingClient(true);
      setErrorMsg(null);
      try {
        const res = await fetch("/api/diagnostics/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            consent: consentChecked,
            client: clientData,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error ?? "Não foi possível iniciar seu diagnóstico.");
          setStartingClient(false);
          return;
        }
        setDiagnosticId(data.diagnosticId);
      } catch {
        setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
        setStartingClient(false);
        return;
      }
      setStartingClient(false);
    }

    if (stepIndex === steps.length - 1) {
      await handleFinalize();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleFinalize() {
    if (!diagnosticId) return;
    setPhase("finalizando");
    const intensityByKey: Record<StyleOption["key"], string> = {
      leve: "Leve",
      média: "Média",
      marcante: "Marcante",
    };
    const finalMakeupAnswers = selectedStyle
      ? { ...makeupAnswers, m1_intensidade: intensityByKey[selectedStyle] }
      : makeupAnswers;
    try {
      const res = await fetch(`/api/diagnostics/${diagnosticId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servico,
          ocasiao,
          imagem_desejada: imagemDesejada,
          photos,
          makeupAnswers: finalMakeupAnswers,
          hairAnswers,
        }),
      });
      const data = await res.json();
      if (res.status === 402 && data.error === "SEM_CREDITOS") {
        setPhase("sem_creditos");
        return;
      }
      if (!res.ok) {
        setErrorMsg(data.error ?? "Não foi possível concluir seu diagnóstico.");
        setPhase("erro");
        return;
      }
      setPhase("concluido");
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente em instantes.");
      setPhase("erro");
    }
  }

  // ---------------------------------------------------------------------
  // CONSENT SCREEN
  // ---------------------------------------------------------------------
  if (phase === "consent") {
    return (
      <CenteredShell>
        <div className="mb-5 flex items-center gap-2">
          <span className="swatch-rule" />
          <span className="eyebrow">Diagnóstico de {professionalName}</span>
        </div>
        <h1 className="text-3xl">Vamos descobrir seu Look DNA?</h1>
        <p className="mt-3 text-graphite/70">
          Esse diagnóstico vai ajudar sua profissional a entender suas cores,
          seus traços, suas preferências, seu estilo e a imagem que você
          deseja transmitir.
        </p>

        <div className="card mt-6 flex gap-3 p-5">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-gold" />
          <p className="text-sm text-graphite/70">{CONSENT_TEXT}</p>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-brown"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
          />
          Li e aceito o uso das minhas informações para gerar meu diagnóstico
          Beauty DNA.
        </label>

        <button
          className="btn-primary mt-6 w-full"
          disabled={!consentChecked}
          onClick={() => setPhase("flow")}
        >
          Começar meu diagnóstico
        </button>
      </CenteredShell>
    );
  }

  // ---------------------------------------------------------------------
  // FINALIZANDO
  // ---------------------------------------------------------------------
  if (phase === "finalizando") {
    return (
      <CenteredShell>
        <div className="flex flex-col items-center py-10 text-center">
          <Sparkles className="animate-pulse text-gold" size={32} />
          <p className="mt-4 text-graphite/70">Gerando seu Look DNA...</p>
        </div>
      </CenteredShell>
    );
  }

  // ---------------------------------------------------------------------
  // CONCLUÍDO
  // ---------------------------------------------------------------------
  if (phase === "concluido") {
    const chosen = styleOptions.find((o) => o.key === selectedStyle);
    return (
      <CenteredShell>
        <div className="py-6 text-center">
          <Sparkles className="mx-auto text-gold" size={30} />
          <h1 className="mt-4 text-2xl">Diagnóstico concluído!</h1>
          <p className="mt-3 text-graphite/70">
            Suas respostas foram enviadas para sua profissional. Ela usará
            seu Beauty DNA para preparar um atendimento mais personalizado.
          </p>
          {chosen && (
            <div className="card mt-6 p-4 text-sm text-brown-deep">
              Você escolheu: <span className="font-semibold">{chosen.nome}</span>
            </div>
          )}
        </div>
      </CenteredShell>
    );
  }

  // ---------------------------------------------------------------------
  // SEM CRÉDITOS
  // ---------------------------------------------------------------------
  if (phase === "sem_creditos") {
    return (
      <CenteredShell>
        <div className="py-6 text-center">
          <ShieldCheck className="mx-auto text-gold" size={30} />
          <h1 className="mt-4 text-2xl">Quase lá!</h1>
          <p className="mt-3 text-graphite/70">
            Sua profissional está sem créditos disponíveis no momento. Suas
            respostas foram salvas com segurança e o diagnóstico será
            finalizado assim que ela renovar os créditos.
          </p>
        </div>
      </CenteredShell>
    );
  }

  // ---------------------------------------------------------------------
  // ERRO
  // ---------------------------------------------------------------------
  if (phase === "erro") {
    return (
      <CenteredShell>
        <div className="py-6 text-center">
          <h1 className="text-2xl">Algo não saiu como esperado</h1>
          <p className="mt-3 text-graphite/70">{errorMsg}</p>
          <button className="btn-secondary mt-6" onClick={() => setPhase("flow")}>
            Voltar e tentar novamente
          </button>
        </div>
      </CenteredShell>
    );
  }

  // ---------------------------------------------------------------------
  // FLOW (dados / atendimento / fotos / perguntas)
  // ---------------------------------------------------------------------
  return (
    <CenteredShell wide>
      <SwatchProgress percent={progressPercent} />
      <p className="mt-3 text-xs uppercase tracking-wide text-graphite/40">
        {stepLabel(step)}
      </p>

      <div className="mt-5 min-h-[280px]">
        {step.kind === "dados" && (
          <div className="space-y-4">
            <h2 className="text-xl">Seus dados</h2>
            <TextInput label="Nome completo" required value={clientData.name} onChange={(v) => setClientData((d) => ({ ...d, name: v }))} />
            <TextInput label="WhatsApp" required value={clientData.whatsapp} onChange={(v) => setClientData((d) => ({ ...d, whatsapp: v }))} placeholder="(11) 91234-5678" />
            <TextInput label="E-mail" value={clientData.email} onChange={(v) => setClientData((d) => ({ ...d, email: v }))} type="email" />
            <TextInput label="Idade" value={clientData.age} onChange={(v) => setClientData((d) => ({ ...d, age: v }))} type="number" />
            <TextInput label="Cidade" value={clientData.city} onChange={(v) => setClientData((d) => ({ ...d, city: v }))} />
            <TextInput label="Instagram" value={clientData.instagram} onChange={(v) => setClientData((d) => ({ ...d, instagram: v }))} placeholder="Opcional" />
            {errorMsg && <p className="text-sm text-rose-deep">{errorMsg}</p>}
          </div>
        )}

        {step.kind === "servico" && (
          <PillQuestion
            title="Qual serviço você fará?"
            options={servicoOpcoes.map((o) => o.label)}
            value={servicoOpcoes.find((o) => o.value === servico)?.label ?? ""}
            onChange={(label) => setServico(servicoOpcoes.find((o) => o.label === label)?.value ?? "")}
          />
        )}

        {step.kind === "ocasiao" && (
          <PillQuestion
            title="Para qual ocasião?"
            options={ocasiaoOpcoes}
            value={ocasiao}
            onChange={setOcasiao}
          />
        )}

        {step.kind === "imagem" && (
          <PillQuestion
            title="Qual imagem você deseja transmitir?"
            options={imagemDesejadaOpcoes}
            value={imagemDesejada}
            onChange={setImagemDesejada}
          />
        )}

        {step.kind === "fotos" && (
          <div className="space-y-6">
            <h2 className="text-xl">Envie sua foto</h2>
            <div className="rounded-xl2 bg-ivory-deep/70 p-4 text-xs text-graphite/60">
              Foto de frente, com boa iluminação, sem filtro, sem maquiagem
              pesada, cabelo afastado do rosto e fundo neutro.
            </div>
            <PhotoUploadField
              label="Foto de frente"
              required
              value={photos.front}
              onChange={(v) => setPhotos((p) => ({ ...p, front: v }))}
            />
            <p className="pt-2 text-xs font-medium uppercase tracking-wide text-graphite/40">
              Opcionais
            </p>
            <div className="flex flex-wrap gap-4">
              <PhotoUploadField label="Foto lateral" value={photos.side} onChange={(v) => setPhotos((p) => ({ ...p, side: v }))} />
              <PhotoUploadField label="Ref. de maquiagem" value={photos.makeupRef} onChange={(v) => setPhotos((p) => ({ ...p, makeupRef: v }))} />
              <PhotoUploadField label="Ref. de penteado" value={photos.hairRef} onChange={(v) => setPhotos((p) => ({ ...p, hairRef: v }))} />
              <PhotoUploadField label="Foto do vestido/look" value={photos.outfitRef} onChange={(v) => setPhotos((p) => ({ ...p, outfitRef: v }))} />
            </div>
          </div>
        )}

        {step.kind === "makeup" && (
          <QuestionRenderer
            question={makeupDnaPerguntas[step.questionIndex]}
            value={makeupAnswers[makeupDnaPerguntas[step.questionIndex].id] ?? ""}
            onChange={(v) =>
              setMakeupAnswers((a) => ({ ...a, [makeupDnaPerguntas[step.questionIndex].id]: v }))
            }
          />
        )}

        {step.kind === "hair" && (
          <QuestionRenderer
            question={hairDnaPerguntas[step.questionIndex]}
            value={hairAnswers[hairDnaPerguntas[step.questionIndex].id] ?? ""}
            onChange={(v) =>
              setHairAnswers((a) => ({ ...a, [hairDnaPerguntas[step.questionIndex].id]: v }))
            }
          />
        )}

        {step.kind === "estilo" && (
          <StyleOptionPicker
            options={styleOptions}
            value={selectedStyle}
            onChange={setSelectedStyle}
          />
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="btn-ghost disabled:opacity-30"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!canAdvance() || startingClient}
          className="btn-primary"
        >
          {startingClient
            ? "Enviando..."
            : stepIndex === steps.length - 1
            ? "Concluir diagnóstico"
            : "Continuar"}
          {!startingClient && <ArrowRight size={16} />}
        </button>
      </div>
    </CenteredShell>
  );
}

function stepLabel(step: FlowStep): string {
  switch (step.kind) {
    case "dados":
      return "Seus dados";
    case "servico":
    case "ocasiao":
    case "imagem":
      return "Sobre o atendimento";
    case "fotos":
      return "Sua foto";
    case "makeup":
      return `Makeup DNA · pergunta ${step.questionIndex + 1} de ${makeupDnaPerguntas.length}`;
    case "hair":
      return `Hair DNA · pergunta ${step.questionIndex + 1} de ${hairDnaPerguntas.length}`;
    case "estilo":
      return "Seu Look DNA";
  }
}

function CenteredShell({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-ivory px-6 py-12">
      <div className={`mx-auto ${wide ? "max-w-xl" : "max-w-lg"}`}>{children}</div>
    </div>
  );
}

function PillQuestion({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((opt) => (
          <ChoicePill key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
        ))}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-rose-deep">*</span>}
      </span>
      <input
        type={type}
        className="input-field"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
