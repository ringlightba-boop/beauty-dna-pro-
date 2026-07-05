import { NextRequest, NextResponse } from "next/server";
import {
  createPaymentOrder,
  getPackageById,
  grantPackageCredits,
  updatePaymentOrder,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth";
import { createPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getBaseUrl } from "@/lib/get-base-url";

export async function POST(req: NextRequest) {
  const profile = getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const { packageId } = await req.json();
  const pkg = getPackageById(packageId);
  if (!pkg) {
    return NextResponse.json({ error: "Pacote inválido." }, { status: 404 });
  }

  // Order starts pending either way. In mock mode it's approved immediately
  // below; in real mode, it stays pending until the Mercado Pago webhook
  // confirms the payment.
  const order = createPaymentOrder({
    professional_id: profile.id,
    package_id: pkg.id,
    provider: isMercadoPagoConfigured() ? "mercado_pago" : "mock",
    status: "pending",
    amount: pkg.price,
    credits: pkg.credits,
    checkout_url: null,
  });

  if (!isMercadoPagoConfigured()) {
    // MVP mock fallback: no MERCADOPAGO_ACCESS_TOKEN set, so simulate an
    // instantly-approved payment. This keeps local/dev testing frictionless.
    updatePaymentOrder(order.id, { status: "approved" });
    grantPackageCredits(profile.id, pkg);
    return NextResponse.json({ ok: true, package: pkg.name });
  }

  // Real Mercado Pago Checkout Pro flow.
  const baseUrl = getBaseUrl();
  try {
    const preference = await createPreference({
      title: `Beauty DNA Pro — Pacote ${pkg.name}`,
      unitPrice: pkg.price,
      backUrls: {
        success: `${baseUrl}/painel/pacotes?status=success`,
        failure: `${baseUrl}/painel/pacotes?status=failure`,
        pending: `${baseUrl}/painel/pacotes?status=pending`,
      },
      notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
      externalReference: order.id,
      metadata: {
        professional_id: profile.id,
        package_id: pkg.id,
        order_id: order.id,
      },
    });

    updatePaymentOrder(order.id, { checkout_url: preference.init_point });

    return NextResponse.json({ ok: true, checkoutUrl: preference.init_point });
  } catch (err) {
    updatePaymentOrder(order.id, { status: "rejected" });
    console.error("Mercado Pago createPreference failed:", err);
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
