import { getCurrentProfile } from "@/lib/auth";
import { ConfiguracoesForm } from "@/components/painel/ConfiguracoesForm";

export default async function ConfiguracoesPage() {
  const profile = (await getCurrentProfile())!;
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Configurações</p>
      <h1 className="mt-1 text-2xl">Seu perfil profissional</h1>
      <p className="mt-1 text-sm text-graphite/60">
        Essas informações aparecem no seu link e na mensagem enviada às
        clientes.
      </p>
      <ConfiguracoesForm profile={profile} />
    </div>
  );
}
