"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

export function PhotoUploadField({
  label,
  required,
  helperText,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  helperText?: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Envie um arquivo de imagem (JPG ou PNG).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("A imagem deve ter até 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">
        {label} {required && <span className="text-rose-deep">*</span>}
      </p>
      {helperText && (
        <p className="mb-2 text-xs text-graphite/60">{helperText}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-36 w-36 rounded-xl2 object-cover shadow-card"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-ink p-1 text-ivory shadow-soft"
            aria-label="Remover foto"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-nude-deep bg-ivory-deep/60 text-brown transition hover:border-gold"
        >
          <Camera size={22} />
          <span className="text-xs font-medium">Enviar foto</span>
        </button>
      )}
      {error && <p className="mt-2 text-xs text-rose-deep">{error}</p>}
    </div>
  );
}
