import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="font-display text-5xl italic text-gold">404</p>
      <h1 className="mt-4 text-2xl">Não encontramos esta página</h1>
      <p className="mt-2 max-w-sm text-sm text-graphite/60">
        O link pode estar incorreto ou ter expirado. Confira o endereço com
        sua profissional.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Voltar para o início
      </Link>
    </div>
  );
}
