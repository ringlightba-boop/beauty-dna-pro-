"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    professional_name: "",
    email: "",
    whatsapp: "",
    city: "",
    state: "",
    instagram: "",
    password: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar sua conta.");
        setLoading(false);
        return;
      }
      router.push("/painel");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-xl italic text-ink">
        Beauty DNA <span className="text-gold">Pro</span>
      </Link>

      <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-brown-deep">
        <Sparkles size={14} className="text-gold" />
        3 diagnósticos grátis ao criar sua conta
      </div>

      <h1 className="text-3xl">Crie sua conta de maquiadora</h1>
      <p className="mt-2 text-sm text-graphite/60">
        Leva menos de 2 minutos. Você já sai com seu link personalizado.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Nome completo" required>
          <input
            className="input-field"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            required
          />
        </Field>
        <Field label="Nome profissional" required helper="Como você é conhecida no trabalho. Vira o seu link: /d/seu-nome">
          <input
            className="input-field"
            value={form.professional_name}
            onChange={(e) => set("professional_name", e.target.value)}
            required
          />
        </Field>
        <Field label="E-mail" required>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </Field>
        <Field label="WhatsApp" required>
          <input
            className="input-field"
            placeholder="(11) 91234-5678"
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cidade" required>
            <input
              className="input-field"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              required
            />
          </Field>
          <Field label="Estado" required>
            <select
              className="input-field"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              required
            >
              <option value="">UF</option>
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Instagram" helper="Opcional">
          <input
            className="input-field"
            placeholder="@seuinstagram"
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
          />
        </Field>
        <Field label="Senha" required helper="Mínimo de 6 caracteres">
          <input
            type="password"
            className="input-field"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
            minLength={6}
          />
        </Field>

        {error && (
          <p className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-deep">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Criando conta..." : "Criar minha conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-graphite/60">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brown-deep underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-rose-deep">*</span>}
      </span>
      {children}
      {helper && <span className="mt-1 block text-xs text-graphite/50">{helper}</span>}
    </label>
  );
}
