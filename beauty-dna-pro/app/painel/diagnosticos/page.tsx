import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { getClientsByProfessional, getDiagnosticsByProfessional } from "@/lib/db";
import { formatDateTime, serviceLabel, statusLabel } from "@/lib/utils";

export default async function DiagnosticosPage() {
  const profile = (await getCurrentProfile())!;
  const diagnostics = await getDiagnosticsByProfessional(profile.id);
  const clients = await getClientsByProfessional(profile.id);

  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Diagnósticos</p>
      <h1 className="mt-1 text-2xl">Todos os diagnósticos</h1>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ivory-deep/70 text-left text-xs uppercase tracking-wide text-graphite/50">
            <tr>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Serviço</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Data</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite/10">
            {diagnostics.map((d) => {
              const client = clients.find((c) => c.id === d.client_id);
              return (
                <tr key={d.id} className="transition hover:bg-ivory-deep/40">
                  <td className="px-5 py-4">
                    <Link href={`/painel/diagnosticos/${d.id}`} className="font-medium text-ink hover:underline">
                      {client?.name ?? "Cliente"}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-4 text-graphite/60 sm:table-cell">
                    {serviceLabel(d.service_type)}
                  </td>
                  <td className="hidden px-5 py-4 text-graphite/60 md:table-cell">
                    {formatDateTime(d.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={d.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {diagnostics.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-graphite/50">
            Nenhum diagnóstico ainda.
          </p>
        )}
      </div>
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
