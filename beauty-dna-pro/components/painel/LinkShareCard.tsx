import { CopyButton } from "@/components/painel/CopyButton";
import { clientLinkPath } from "@/lib/utils";

export function LinkShareCard({
  slug,
  message,
  baseUrl,
}: {
  slug: string;
  message: string;
  baseUrl: string;
}) {
  const fullLink = `${baseUrl}${clientLinkPath(slug)}`;

  return (
    <div className="card p-6">
      <p className="eyebrow mb-3">Meu link</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-xl bg-ivory-deep px-4 py-3 text-sm text-brown-deep">
          {fullLink}
        </code>
        <CopyButton text={fullLink} label="Copiar link" />
      </div>

      <p className="eyebrow mb-3 mt-6">Mensagem pronta para WhatsApp</p>
      <p className="rounded-xl bg-ivory-deep px-4 py-3 text-sm text-graphite/80">
        {message}
      </p>
      <div className="mt-3">
        <CopyButton text={`${message}\n\n${fullLink}`} label="Copiar mensagem + link" />
      </div>
    </div>
  );
}
