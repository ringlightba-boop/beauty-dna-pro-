import Link from "next/link";
import { Users, ClipboardCheck, ClipboardList, FileText } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getClientsByProfessional, getDiagnosticsByProfessional } from "@/lib/db";
import { CreditBadge } from "@/components/ui/CreditBadge";
import { LinkShareCard } from "@/components/painel/LinkShareCard";
import { getBaseUrl } from "@/lib/get-base-url";
import { formatDateTime, statusLabel } from "@/lib/utils";

export default function DashboardPage() {
  const profile = getCurrentProfile()!;
  const diagnostics = getDiagnosticsByProfessional(profile.id);
  const clients = getClientsByProfessional(profile.id);
  const concluidos = diagnostics.filter((d) => d.status === "concluido");
  const pendentes = diagnostics.filter((d) => d.status === "aguardando_cliente");
  const isUnlimited = profile.plan_type === "unlimited";

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-1 text-2xl">Olá, {profile.professional_name} 👋</h1>
        </div>
        <CreditBadge credits={profile.credits_available} unlimited={isUnlimited} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Clientes" value={clients.length} />
        <StatCard icon={ClipboardList} label="Clientes pendentes" value={pendentes.length} />
        <StatCard icon={ClipboardCheck} label="Diagnósticos concluídos" value={concluidos.length} />
        <StatCard icon={FileText} label="Relatórios gerados" value={concluidos.length} />
      </div>

      {profile.credits_available <= 0 && !isUnlimited && (
        <div className="mt-6 rounded-xl2 border border-gold/30 bg-gold/10 p-5 text-sm text-brown-deep">
          Você está sem créditos disponíveis. Novos diagnósticos ficarão
          pendentes até você{" "}
          <Link href="/painel/pacotes" className="font-semibold underline">
            renovar seus créditos
          </Link>
          .
        </div>
      )}

      <div className="mt-8">
        <LinkShareCard
          slug={profile.slug}
          message={profile.default_message}
          baseUrl={getBaseUrl()}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Diagnósticos recentes</p>
          <Link href="/painel/diagnosticos" className="text-sm font-medium text-brown-deep underline">
            Ver todos
          </Link>
        </div>
        <div className="card mt-3 divide-y divide-graphite/10">
          {diagnostics.slice(0, 5).map((d) => {
            const client = clients.find((c) => c.id === d.client_id);
            return (
              <Link
                key={d.id}
                href={`/painel/diagnosticos/${d.id}`}
                className="flex items-center justify-between px-5 py-4 text-sm transition hover:bg-ivory-deep/60"
              >
                <div>
                  <p className="font-medium text-ink">{client?.name ?? "Cliente"}</p>
                  <p className="text-xs text-graphite/50">{formatDateTime(d.created_at)}</p>
                </div>
                <StatusPill status={d.status} />
              </Link>
            );
          })}
          {diagnostics.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-graphite/50">
              Nenhum diagnóstico ainda. Compartilhe seu link para começar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="card p-5">
      <Icon size={18} className="text-gold" />
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-graphite/60">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    concluido: "bg-brown/10 text-brown-deep",
    aguardando_cliente: "bg-gold/15 text-brown-deep",
    cancelado: "bg-graphite/10 text-graphite/60",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? ""}`}>
      {statusLabel(status)}
    </span>
  );
}
