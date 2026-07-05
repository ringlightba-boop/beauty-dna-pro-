const MP_API_BASE = "https://api.mercadopago.com";

function getAccessToken(): string | null {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || null;
}

export function isMercadoPagoConfigured(): boolean {
  return !!getAccessToken();
}

interface CreatePreferenceInput {
  title: string;
  unitPrice: number;
  quantity?: number;
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl: string;
  externalReference: string;
  metadata: Record<string, string>;
  statementDescriptor?: string;
}

interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export async function createPreference(
  input: CreatePreferenceInput
): Promise<MercadoPagoPreference> {
  const token = getAccessToken();
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");

  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: input.title,
          quantity: input.quantity ?? 1,
          currency_id: "BRL",
          unit_price: input.unitPrice,
        },
      ],
      back_urls: input.backUrls,
      auto_return: "approved",
      notification_url: input.notificationUrl,
      external_reference: input.externalReference,
      metadata: input.metadata,
      statement_descriptor: (input.statementDescriptor ?? "BEAUTYDNAPRO").slice(0, 13),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago (create preference) falhou: ${res.status} ${text}`);
  }

  return res.json();
}

export interface MercadoPagoPayment {
  id: number;
  status: "approved" | "pending" | "rejected" | "in_process" | "cancelled" | "refunded" | string;
  external_reference: string | null;
  metadata: Record<string, string>;
  transaction_amount: number;
}

export async function getPayment(paymentId: string): Promise<MercadoPagoPayment> {
  const token = getAccessToken();
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");

  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago (get payment) falhou: ${res.status} ${text}`);
  }

  return res.json();
}
