import { getCurrentProfile } from "@/lib/auth";
import { LinkShareCard } from "@/components/painel/LinkShareCard";
import { getBaseUrl } from "@/lib/get-base-url";

export default async function MeuLinkPage() {
  const profile = (await getCurrentProfile())!;

  return (
    <div className="max-w-3xl">
      <p className="eyebrow">Meu link</p>
      <h1 className="mt-1 text-2xl">Seu link personalizado</h1>
      <p className="mt-2 text-sm text-graphite/60">
        Compartilhe este link com suas clientes antes de cada atendimento.
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
