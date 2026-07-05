"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";

export function CopyButton({
  text,
  label = "Copiar",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // no-op — clipboard may be unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-graphite/15 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-gold",
        className
      )}
    >
      {copied ? <Check size={15} className="text-gold" /> : <Copy size={15} />}
      {copied ? "Copiado!" : label}
    </button>
  );
}
