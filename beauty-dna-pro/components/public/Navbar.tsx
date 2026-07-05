import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-graphite/10 bg-ivory/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl italic text-ink">
          Beauty DNA <span className="text-gold">Pro</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-graphite/70 md:flex">
          <a href="#como-funciona" className="hover:text-ink">Como funciona</a>
          <a href="#entrega" className="hover:text-ink">O que você recebe</a>
          <a href="#planos" className="hover:text-ink">Planos</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn-primary">
            Criar minha conta
          </Link>
        </div>
      </div>
    </header>
  );
}
