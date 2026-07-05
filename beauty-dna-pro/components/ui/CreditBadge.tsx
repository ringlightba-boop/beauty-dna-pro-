import { Sparkles } from "lucide-react";

export function CreditBadge({
  credits,
  unlimited,
}: {
  credits: number;
  unlimited?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-brown-deep">
      <Sparkles size={16} className="text-gold" />
      {unlimited ? "Créditos ilimitados" : `${credits} ${credits === 1 ? "crédito" : "créditos"}`}
    </div>
  );
}
