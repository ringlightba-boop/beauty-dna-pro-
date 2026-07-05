import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getClientById, getDiagnosticById } from "@/lib/db";
import { formatDateTime, serviceLabel } from "@/lib/utils";
import { DiagnosticoEditor } from "@/components/painel/DiagnosticoEditor";
import { getBaseUrl } from "@/lib/get-base-url";
import { clientLinkPath } from "@/lib/utils";

export default async function DiagnosticoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = (await getCurrentProfile())!;
  const diagnostic = await getDiagnosticById(params.id);

  if (!diagnostic || diagnostic.professional_id !== profile.id) {
    notFound();
  }

  const client = await getClientById(diagnostic!.client_id);

  if (diagnostic!.status === "aguardando_cliente") {
    const link = `${getBaseUrl()}${clientLinkPath(profile.slug)}`;
    return (
      <div className="max-w-2xl">
        <p className="eyebrow">Diagnóstico pendente</p>
        <h1 className="mt-1 text-2xl">{client?.name ?? "Cliente"}</h1>
        <p className="mt-1 text-sm text-graphite/50">
          Iniciado em {formatDateTime(diagnostic!.created_at)}
        </p>
        <div className="card mt-6 p-6 text-sm text-graphite/70">
          <p>
            Esta cliente ainda não concluiu o questionário
            {profile.credits_available <= 0 && profile.plan_type !== "unlimited"
              ? ", ou você está sem créditos disponíveis para finalizar o diagnóstico dela"
              : ""}
            . Assim que ela terminar, o relatório completo aparecerá aqui
            automaticamente.
          </p>
          <p className="mt-3">
            Link para reenviar, se precisar: <br />
            <code className="text-brown-deep">{link}</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <DiagnosticoEditor
      diagnostic={diagnostic!}
      client={client ?? null}
      professional={profile}
      subtitle={`${serviceLabel(diagnostic!.service_type)} · ${formatDateTime(diagnostic!.created_at)}`}
    />
  );
}
