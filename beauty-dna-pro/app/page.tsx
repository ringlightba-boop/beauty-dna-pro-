import Link from "next/link";
import { Sparkles, Camera, ClipboardList, FileText, Check } from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { getPackages } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

// This page fetches live pricing from Supabase, which isn't reachable
// during the build step (e.g. on Render's build servers) — render it per
// request instead of trying to statically prerender it at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const packages = await getPackages();

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="swatch-rule" />
            <span className="eyebrow">Diagnóstico inteligente de beleza</span>
          </div>
          <h1 className="text-4xl leading-[1.15] md:text-5xl">
            Antes de maquiar um rosto,{" "}
            <span className="italic text-brown-deep">descubra o DNA</span> da
            beleza que existe nele.
          </h1>
          <p className="mt-6 max-w-lg text-base text-graphite/70">
            Uma plataforma inteligente para maquiadoras analisarem foto,
            preferências, colorimetria, visagismo, comportamento e ocasião
            antes do atendimento.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/cadastro" className="btn-primary">
              Criar minha conta
            </Link>
            <a href="#como-funciona" className="btn-secondary">
              Ver como funciona
            </a>
          </div>
          <p className="mt-5 text-xs text-graphite/50">
            3 diagnósticos grátis para começar. Sem cartão de crédito.
          </p>
        </div>

        {/* Signature: stylized preview of the Look DNA report card */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-nude/40 via-rose/20 to-transparent blur-2xl" />
          <div className="card mx-auto max-w-sm p-6">
            <div className="swatch-rule mb-4" />
            <p className="eyebrow mb-1">Look DNA Report</p>
            <p className="font-display text-xl italic text-ink">
              Elegância Fria, Feminina e Sofisticada
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <ReportPreviewRow label="Acabamento" value="Semi-matte natural" />
              <ReportPreviewRow label="Blush" value="Rosa queimado" />
              <ReportPreviewRow label="Olhos" value="Taupe / marrom frio" />
              <ReportPreviewRow label="Boca" value="Nude rosado" />
              <ReportPreviewRow label="Penteado" value="Semi-preso, ondas suaves" />
            </div>
            <div className="mt-5 rounded-xl bg-ivory-deep p-3 text-xs text-graphite/60">
              Diagnóstico estético orientativo — pronto para editar antes de
              enviar à cliente.
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="border-y border-graphite/10 bg-ivory-deep/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="eyebrow">O problema</span>
          <h2 className="mt-3 max-w-2xl text-3xl">
            Atender sem saber o que a cliente realmente quer custa tempo,
            retrabalho e insegurança.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                titulo: "Cliente chega sem saber explicar o que quer",
                texto:
                  "Referências soltas, expectativas desalinhadas e um briefing incompleto no meio da cadeira.",
              },
              {
                titulo: "Cada atendimento começa do zero",
                texto:
                  "Sem histórico de preferências, colorimetria ou ocasião, o diagnóstico acontece — quando acontece — no improviso.",
              },
              {
                titulo: "Resultado fora do esperado gera frustração",
                texto:
                  "Sem alinhamento prévio, o risco de retrabalho e de uma cliente insatisfeita aumenta.",
              },
            ].map((item) => (
              <div key={item.titulo} className="card p-6">
                <p className="font-display text-lg text-ink">{item.titulo}</p>
                <p className="mt-2 text-sm text-graphite/65">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center">
          <div>
            <span className="eyebrow">A solução</span>
            <h2 className="mt-3 text-3xl">
              O Beauty DNA Pro chega antes de você — e prepara o terreno.
            </h2>
            <p className="mt-4 text-graphite/70">
              Sua cliente responde um questionário completo e envia uma foto
              antes do dia do atendimento. Você recebe um relatório
              organizado com direção de cor, estilo e penteado — pronto para
              editar do seu jeito e usar como roteiro de trabalho.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SolucaoIcon icon={Camera} label="Foto de apoio" />
            <SolucaoIcon icon={ClipboardList} label="Questionário guiado" />
            <SolucaoIcon icon={FileText} label="Relatório editável" />
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-graphite/10 bg-ivory-deep/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="eyebrow">Como funciona</span>
          <h2 className="mt-3 text-3xl">Quatro passos até o Look DNA Report.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {[
              {
                n: "01",
                t: "Crie sua conta",
                d: "Cadastro rápido e você já recebe seu link personalizado e 3 diagnósticos grátis.",
              },
              {
                n: "02",
                t: "Envie o link",
                d: "Compartilhe com sua cliente antes do atendimento, por WhatsApp.",
              },
              {
                n: "03",
                t: "Ela responde",
                d: "Consentimento, dados, ocasião, preferências e foto — tudo em uma jornada leve.",
              },
              {
                n: "04",
                t: "Você recebe o relatório",
                d: "Makeup DNA, Hair DNA e Look DNA prontos para editar, copiar e enviar.",
              },
            ].map((step) => (
              <div key={step.n}>
                <p className="font-display text-3xl italic text-gold">{step.n}</p>
                <p className="mt-3 font-display text-lg text-ink">{step.t}</p>
                <p className="mt-2 text-sm text-graphite/65">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE O SISTEMA ENTREGA */}
      <section id="entrega" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="eyebrow">O que você recebe</span>
          <h2 className="mt-3 text-3xl">Um relatório com três camadas de diagnóstico.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <EntregaCard
              titulo="Makeup DNA"
              itens={[
                "Temperatura de cor e contraste",
                "Acabamento e cobertura ideais",
                "Blush, batom e sombra recomendados",
                "Cores para evitar",
              ]}
            />
            <EntregaCard
              titulo="Hair DNA"
              itens={[
                "Penteados indicados para o estilo dela",
                "O que evitar",
                "Leitura de tipo, volume e comprimento",
              ]}
            />
            <EntregaCard
              titulo="Look DNA"
              itens={[
                "Resumo executivo do atendimento",
                "Checklist de execução",
                "Resumo pronto para WhatsApp",
                "PDF para enviar à cliente",
              ]}
            />
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-y border-graphite/10 bg-ivory-deep/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="eyebrow">Planos</span>
          <h2 className="mt-3 text-3xl">Comece grátis, cresça no seu ritmo.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <div className="card flex flex-col p-6 ring-1 ring-gold/40">
              <p className="font-display text-lg text-ink">Boas-vindas</p>
              <p className="mt-2 text-3xl font-semibold">Grátis</p>
              <p className="mt-1 text-sm text-graphite/60">3 diagnósticos</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-graphite/70">
                <li className="flex items-center gap-2"><Check size={15} className="text-gold"/> Sem cartão de crédito</li>
                <li className="flex items-center gap-2"><Check size={15} className="text-gold"/> Link personalizado</li>
              </ul>
              <Link href="/cadastro" className="btn-primary mt-6">Criar conta</Link>
            </div>
            {packages.map((pkg) => (
              <div key={pkg.id} className="card flex flex-col p-6">
                <p className="font-display text-lg text-ink">{pkg.name}</p>
                <p className="mt-2 text-3xl font-semibold">{formatCurrency(pkg.price)}</p>
                <p className="mt-1 text-sm text-graphite/60">
                  {pkg.unlimited ? "Diagnósticos ilimitados / mês" : `${pkg.credits} diagnósticos`}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-graphite/70">
                  <li className="flex items-center gap-2"><Check size={15} className="text-gold"/> Relatório editável</li>
                  <li className="flex items-center gap-2"><Check size={15} className="text-gold"/> PDF + resumo WhatsApp</li>
                </ul>
                <Link href="/cadastro" className="btn-secondary mt-6">Assinar depois de criar conta</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAMADA FINAL */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Sparkles className="mx-auto mb-4 text-gold" size={28} />
          <h2 className="text-3xl md:text-4xl">
            Comece agora com 3 diagnósticos grátis.
          </h2>
          <p className="mt-4 text-graphite/70">
            Crie sua conta, receba seu link e transforme o próximo atendimento
            em uma experiência sob medida.
          </p>
          <Link href="/cadastro" className="btn-primary mt-8 inline-flex">
            Criar minha conta
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ReportPreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-graphite/10 pb-2">
      <span className="text-graphite/50">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function SolucaoIcon({
  icon: Icon,
  label,
}: {
  icon: typeof Camera;
  label: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-5 text-center">
      <div className="rounded-full bg-nude/50 p-3 text-brown-deep">
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-ink">{label}</p>
    </div>
  );
}

function EntregaCard({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div className="card p-6">
      <div className="swatch-rule mb-4" />
      <p className="font-display text-xl italic text-ink">{titulo}</p>
      <ul className="mt-4 space-y-2 text-sm text-graphite/70">
        {itens.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check size={15} className="mt-0.5 shrink-0 text-gold" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
