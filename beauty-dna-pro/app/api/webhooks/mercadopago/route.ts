import { NextRequest, NextResponse } from "next/server";
import {
  getPackageById,
  getPaymentOrderById,
  grantPackageCredits,
  updatePaymentOrder,
  wasPaymentAlreadyProcessed,
} from "@/lib/db";
import { getPayment } from "@/lib/mercadopago";

function extractPaymentId(req: NextRequest, body: any): string | null {
  // Mercado Pago has sent notifications in a couple of shapes over the
  // years. Handle the common ones defensively rather than assuming one.
  const params = req.nextUrl.searchParams;

  if (body?.type === "payment" && body?.data?.id) return String(body.data.id);
  if (body?.action?.startsWith("payment.") && body?.data?.id) return String(body.data.id);

  const queryType = params.get("type") ?? params.get("topic");
  const queryId = params.get("data.id") ?? params.get("id");
  if (queryType === "payment" && queryId) return queryId;

  return null;
}

export async function POST(req: NextRequest) {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    // Some notifications arrive with an empty body and info only in the
    // query string — that's fine, extractPaymentId falls back to it.
  }

  const paymentId = extractPaymentId(req, body);
  if (!paymentId) {
    // Not a payment notification we care about (e.g. merchant_order topic).
    return NextResponse.json({ ok: true, ignored: true });
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (err) {
    console.error("Mercado Pago webhook: failed to fetch payment", err);
    // Return 500 so Mercado Pago retries the notification later.
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const professionalId = payment.metadata?.professional_id;
  const packageId = payment.metadata?.package_id;
  const orderId = payment.metadata?.order_id;

  if (!professionalId || !packageId) {
    console.error("Mercado Pago webhook: payment missing expected metadata", payment.id);
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (orderId) {
    const order = getPaymentOrderById(orderId);
    if (order) {
      updatePaymentOrder(orderId, {
        status: payment.status === "approved" ? "approved" : payment.status === "rejected" ? "rejected" : "pending",
      });
    }
  }

  if (payment.status !== "approved") {
    // Pending/in_process/rejected — nothing to credit yet. Mercado Pago
    // will send another notification if the status changes later.
    return NextResponse.json({ ok: true });
  }

  const reference = `MP #${payment.id}`;
  if (wasPaymentAlreadyProcessed(professionalId, reference)) {
    // Duplicate notification for a payment we already credited — Mercado
    // Pago retries notifications, so this must be a safe no-op.
    return NextResponse.json({ ok: true, already_processed: true });
  }

  const pkg = getPackageById(packageId);
  if (!pkg) {
    console.error("Mercado Pago webhook: unknown package_id in metadata", packageId);
    return NextResponse.json({ ok: true, ignored: true });
  }

  grantPackageCredits(professionalId, pkg, reference);

  return NextResponse.json({ ok: true });
}

// Mercado Pago occasionally verifies the endpoint with a GET request.
export async function GET() {
  return NextResponse.json({ ok: true });
}
