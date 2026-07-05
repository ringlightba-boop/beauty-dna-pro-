import { getCurrentProfile } from "@/lib/auth";
import { getPackages } from "@/lib/db";
import { CreditBadge } from "@/components/ui/CreditBadge";
import { PacotesGrid } from "@/components/painel/PacotesGrid";

export default function PacotesPage({
  searchParams,
}: {
  searchParams: { motivo?: string };
}) {
  const profile = getCurrentProfile()!;
  const packages = getPackages();
  const isUnlimited = profile.plan_type === "unlimited";

  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Pacotes</p>
      <h1 className="mt-1 text-2xl">Créditos e planos</h1>

      {searchParams.motivo === "sem-creditos" && (
        <div className="mt-4 rounded-xl2 border border-rose/30 bg-rose/10 p-4 text-sm text-rose-deep">
          Você está sem créditos disponíveis. Escolha um pacote abaixo para
          continuar recebendo diagnósticos.
        </div>
      )}

      <div className="mt-4">
        <CreditBadge credits={profile.credits_available} unlimited={isUnlimited} />
      </div>

      <p className="mt-2 text-xs text-graphite/50">
        Pagamento simulado nesta versão MVP — a compra libera os créditos
        imediatamente. A arquitetura já está preparada para a futura
        integração com o Checkout Pro do Mercado Pago via webhook.
      </p>

      <PacotesGrid packages={packages} currentPlan={profile.plan_type} />
    </div>
  );
}
