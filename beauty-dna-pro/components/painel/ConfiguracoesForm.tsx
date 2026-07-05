"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

export function ConfiguracoesForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [form, setForm] = useState({
    professional_name: profile.professional_name,
    whatsapp: profile.whatsapp,
    city: profile.city,
    state: profile.state,
    instagram: profile.instagram ?? "",
    brand_name: profile.brand_name ?? "",
    brand_color: profile.brand_color ?? "#AD8A52",
    default_message: profile.default_message,
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSavedAt(new Date().toLocaleTimeString("pt-BR"));
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
      <Field label="Nome profissional">
        <input className="input-field" value={form.professional_name} onChange={(e) => set("professional_name", e.target.value)} />
      </Field>
      <Field label="Nome da marca" helper="Opcional — usado em relatórios futuros com sua identidade visual">
        <input className="input-field" value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="WhatsApp">
          <input className="input-field" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="Cor da marca">
          <input type="color" className="h-11 w-full rounded-xl border border-graphite/15" value={form.brand_color} onChange={(e) => set("brand_color", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cidade">
          <input className="input-field" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Estado">
          <input className="input-field" value={form.state} onChange={(e) => set("state", e.target.value)} />
        </Field>
      </div>
      <Field label="Instagram">
        <input className="input-field" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
      </Field>
      <Field label="Mensagem padrão de WhatsApp">
        <textarea
          className="input-field min-h-[100px]"
          value={form.default_message}
          onChange={(e) => set("default_message", e.target.value)}
        />
      </Field>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
      {savedAt && <p className="text-xs text-brown-deep">Salvo às {savedAt}.</p>}
    </form>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {helper && <span className="mt-1 block text-xs text-graphite/50">{helper}</span>}
    </label>
  );
}
