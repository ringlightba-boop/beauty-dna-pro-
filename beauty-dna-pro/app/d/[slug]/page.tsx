import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/db";
import { ClienteWizard } from "@/components/cliente/ClienteWizard";

export default function ClienteDiagnosticoPage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = getProfileBySlug(params.slug);
  if (!profile) {
    notFound();
  }

  return (
    <ClienteWizard
      slug={profile!.slug}
      professionalName={profile!.professional_name}
    />
  );
}
