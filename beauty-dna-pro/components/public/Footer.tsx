export function Footer() {
  return (
    <footer className="border-t border-graphite/10 bg-ivory-deep/50 py-10">
      <div className="mx-auto max-w-6xl px-6 text-sm text-graphite/60">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display italic text-ink">Beauty DNA Pro AI</p>
          <p>Diagnóstico estético e orientativo — não substitui avaliação profissional presencial.</p>
        </div>
        <p>&copy; {new Date().getFullYear()} Beauty DNA Pro AI. Feito para quem transforma beleza em experiência.</p>
      </div>
    </footer>
  );
}
