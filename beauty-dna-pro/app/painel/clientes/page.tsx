import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { getClientsByProfessional, getDiagnosticsByProfessional } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default function ClientesPage() {
  const profile = getCurrentProfile()!;
  const clients = getClientsByProfessional(profile.id);
  const diagnostics = getDiagnosticsByProfessional(profile.id);

  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Clientes</p>
      <h1 className="mt-1 text-2xl">Suas clientes</h1>
      <p className="mt-1 text-sm text-graphite/60">
        Toda cliente que preenche seu link aparece aqui automaticamente.
      </p>

      <div className="card mt-6 divide-y divide-graphite/10">
        {clients.map((client) => {
          const clientDiagnostics = diagnostics.filter((d) => d.client_id === client.id);
          const latest = clientDiagnostics[0];
          return (
            <div key={client.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium text-ink">{client.name}</p>
                <p className="text-xs text-graphite/50">
                  {client.whatsapp} · desde {formatDate(client.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-graphite/50">
                  {clientDiagnostics.length} diagnóstico(s)
                </span>
                {latest && (
                  <Link
                    href={`/painel/diagnosticos/${latest.id}`}
                    className="btn-ghost !px-4 !py-1.5 text-xs"
                  >
                    Ver diagnóstico
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {clients.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-graphite/50">
            Nenhuma cliente ainda. Compartilhe seu link personalizado para
            começar a receber diagnósticos.
          </p>
        )}
      </div>
    </div>
  );
}
