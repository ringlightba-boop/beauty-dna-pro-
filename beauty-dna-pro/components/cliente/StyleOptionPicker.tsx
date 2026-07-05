"use client";

import { Check } from "lucide-react";
import clsx from "clsx";
import type { StyleOption } from "@/lib/diagnostic-engine";

const INTENSITY_LEVEL: Record<StyleOption["key"], number> = {
  leve: 1,
  média: 2,
  marcante: 3,
};

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            i <= level ? "bg-gold" : "bg-graphite/15"
          )}
        />
      ))}
    </div>
  );
}

export function StyleOptionPicker({
  options,
  value,
  onChange,
}: {
  options: StyleOption[];
  value: StyleOption["key"] | null;
  onChange: (key: StyleOption["key"]) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl">Qual desses estilos combina mais com você?</h2>
      <p className="text-sm text-graphite/60">
        As três opções partem da mesma paleta de cores identificada nas suas
        respostas — o que muda é a intensidade da aplicação. Escolha o que
        mais combina com o que você imagina para o dia.
      </p>
      <div className="grid gap-3">
        {options.map((opt) => {
          const selected = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={clsx(
                "rounded-xl2 border p-5 text-left transition",
                selected
                  ? "border-brown bg-brown/5 shadow-soft"
                  : "border-graphite/15 bg-white hover:border-gold-light"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg italic text-ink">{opt.nome}</p>
                    <IntensityDots level={INTENSITY_LEVEL[opt.key]} />
                  </div>
                  <p className="mt-1.5 text-sm text-graphite/70">{opt.descricao}</p>
                </div>
                {selected && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brown text-ivory">
                    <Check size={14} />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-graphite/45">
        Sua paleta: {options[0]?.cores.join(" · ")}
      </p>
    </div>
  );
}
