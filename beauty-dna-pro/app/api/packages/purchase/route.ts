import { NextRequest, NextResponse } from "next/server";
import {
  adjustCredits,
  createPaymentOrder,
  getPackageById,
  updatePaymentOrder,
  updateProfile,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth";

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

  // 1. Create the order in "pending" state — this is exactly the shape a
  //    real Mercado Pago Checkout Pro integration would need: we already
  //    persist provider/status/checkout_url so a webhook handler could
  //    flip `status` to "approved" asynchronously instead of doing it here.
  const order = createPaymentOrder({
    professional_id: profile.id,
    package_id: pkg.id,
    provider: "mock",
    status: "pending",
    amount: pkg.price,
    credits: pkg.credits,
    checkout_url: null,
  });

  // 2. MVP mock: simulate an instantly-approved payment.
  updatePaymentOrder(order.id, { status: "approved" });

  if (pkg.unlimited) {
    updateProfile(profile.id, {
      plan_type: "unlimited",
      plan_status: "active",
    });
  } else {
    updateProfile(profile.id, { plan_type: "credits" });
  }

  adjustCredits(
    profile.id,
    pkg.unlimited ? 0 : pkg.credits,
    "purchase",
    `Compra do pacote ${pkg.name}`,
  );

  return NextResponse.json({ ok: true, package: pkg.name });
}
