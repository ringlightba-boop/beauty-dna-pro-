import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { LinkShareCard } from "@/components/painel/LinkShareCard";
import { getBaseUrl } from "@/lib/get-base-url";

export default async function NovoDiagnosticoPage() {
  const profile = (await getCurrentProfile())!;
  const isUnlimited = profile.plan_type === "unlimited";

  if (!isUnlimited && profile.credits_available <= 0) {
    redirect("/painel/pacotes?motivo=sem-creditos");
  }

  return (
    <div className="max-w-3xl">
      <p className="eyebrow">Novo diagnóstico</p>
      <h1 className="mt-1 text-2xl">Envie o link para sua próxima cliente</h1>
      <p className="mt-2 text-sm text-graphite/60">
        O diagnóstico é preenchido pela própria cliente no link abaixo. Assim
        que ela concluir, o relatório aparece automaticamente em{" "}
        <span className="font-medium text-ink">Diagnósticos</span> e 1
        crédito é consumido.
      </p>

      <div className="mt-6">
        <LinkShareCard
          slug={profile.slug}
          message={profile.default_message}
          baseUrl={getBaseUrl()}
        />
      </div>
    </div>
  );
}
