"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { Package, PlanType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PacotesGrid({
  packages,
  currentPlan,
}: {
  packages: Package[];
  currentPlan: PlanType;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handlePurchase(pkg: Package) {
    setLoadingId(pkg.id);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/packages/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      if (res.ok) {
        setSuccessMsg(
          pkg.unlimited
            ? "Plano ilimitado ativado com sucesso!"
            : `${pkg.credits} créditos adicionados com sucesso!`
        );
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {successMsg && (
        <div className="mt-6 flex items-center gap-2 rounded-xl2 border border-gold/30 bg-gold/10 p-4 text-sm text-brown-deep">
          <CheckCircle2 size={16} className="text-gold" />
          {successMsg}
        </div>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const isActiveUnlimited = pkg.unlimited && currentPlan === "unlimited";
          return (
            <div key={pkg.id} className="card flex flex-col p-6">
              <p className="font-display text-lg text-ink">{pkg.name}</p>
              <p className="mt-2 text-3xl font-semibold">{formatCurrency(pkg.price)}</p>
              <p className="mt-1 text-sm text-graphite/60">
                {pkg.unlimited ? "Diagnósticos ilimitados / mês" : `${pkg.credits} diagnósticos`}
              </p>
              <button
                onClick={() => handlePurchase(pkg)}
                disabled={loadingId === pkg.id || isActiveUnlimited}
                className="btn-primary mt-6"
              >
                {isActiveUnlimited
                  ? "Plano ativo"
                  : loadingId === pkg.id
                  ? "Processando..."
                  : "Comprar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
