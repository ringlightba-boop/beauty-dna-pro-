import { v4 as uuid } from "uuid";
import { getSupabaseAdmin } from "./supabase/admin";
import type {
  Profile,
  Client,
  Diagnostic,
  CreditTransaction,
  Package,
  PaymentOrder,
} from "./types";

// ---------------------------------------------------------------------------
// SUPABASE-BACKED DATA LAYER
// ---------------------------------------------------------------------------
// Same function surface as the original mock (file-based) implementation —
// every page/API route still imports from here and nothing else needed to
// change except adding `await` at each call site, since these are now
// asynchronous network calls instead of synchronous file reads.
// ---------------------------------------------------------------------------

function now(): string {
  return new Date().toISOString();
}

function unwrap<T>(data: T | null, error: { message: string } | null, context: string): T {
  if (error) {
    throw new Error(`Supabase error (${context}): ${error.message}`);
  }
  return data as T;
}

// --- Profiles ---------------------------------------------------------

export async function createProfile(
  input: Omit<
    Profile,
    | "id"
    | "user_id"
    | "credits_available"
    | "free_credits_used"
    | "plan_type"
    | "plan_status"
    | "created_at"
    | "updated_at"
    | "default_message"
    | "slug"
  > & { slug: string }
): Promise<Profile> {
  const db = getSupabaseAdmin();
  const id = uuid();
  const timestamp = now();

  const profile: Profile = {
    ...input,
    id,
    user_id: id,
    default_message:
      "Oi, linda! Antes do nosso atendimento, preencha seu Beauty DNA. Ele vai me ajudar a entender suas cores, seu estilo, sua ocasião e a imagem que você deseja transmitir com a maquiagem e/ou penteado. É rapidinho e vai deixar nosso atendimento muito mais personalizado.",
    credits_available: 3,
    free_credits_used: 0,
    plan_type: "free",
    plan_status: "active",
    created_at: timestamp,
    updated_at: timestamp,
  };

  const { data, error } = await db.from("profiles").insert(profile).select().single();
  unwrap(data, error, "createProfile");

  const { error: txError } = await db.from("credit_transactions").insert({
    id: uuid(),
    professional_id: id,
    transaction_type: "grant_free",
    amount: 3,
    description: "3 diagnósticos grátis de boas-vindas",
    created_at: timestamp,
  });
  if (txError) throw new Error(`Supabase error (createProfile tx): ${txError.message}`);

  return profile;
}

export async function getProfileById(id: string): Promise<Profile | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase error (getProfileById): ${error.message}`);
  return (data as Profile) ?? undefined;
}

export async function getProfileByEmail(email: string): Promise<Profile | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("profiles").select("*").ilike("email", email).maybeSingle();
  if (error) throw new Error(`Supabase error (getProfileByEmail): ${error.message}`);
  return (data as Profile) ?? undefined;
}

export async function getProfileBySlug(slug: string): Promise<Profile | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("profiles").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Supabase error (getProfileBySlug): ${error.message}`);
  return (data as Profile) ?? undefined;
}

export async function slugExists(slug: string): Promise<boolean> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("profiles").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Supabase error (slugExists): ${error.message}`);
  return !!data;
}

export async function updateProfile(
  id: string,
  patch: Partial<Profile>
): Promise<Profile | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("profiles")
    .update({ ...patch, updated_at: now() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Supabase error (updateProfile): ${error.message}`);
  return (data as Profile) ?? undefined;
}

export async function adjustCredits(
  professionalId: string,
  amount: number,
  type: CreditTransaction["transaction_type"],
  description: string,
  diagnosticId?: string
): Promise<Profile | undefined> {
  const db = getSupabaseAdmin();
  const profile = await getProfileById(professionalId);
  if (!profile) return undefined;

  const { data, error } = await db
    .from("profiles")
    .update({ credits_available: profile.credits_available + amount, updated_at: now() })
    .eq("id", professionalId)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Supabase error (adjustCredits): ${error.message}`);

  const { error: txError } = await db.from("credit_transactions").insert({
    id: uuid(),
    professional_id: professionalId,
    transaction_type: type,
    amount,
    description,
    diagnostic_id: diagnosticId ?? null,
    created_at: now(),
  });
  if (txError) throw new Error(`Supabase error (adjustCredits tx): ${txError.message}`);

  return (data as Profile) ?? undefined;
}

export async function getTransactions(professionalId: string): Promise<CreditTransaction[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("credit_transactions")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase error (getTransactions): ${error.message}`);
  return (data as CreditTransaction[]) ?? [];
}

// --- Clients ------------------------------------------------------------

export async function createClient(input: Omit<Client, "id" | "created_at">): Promise<Client> {
  const db = getSupabaseAdmin();
  const client: Client = { ...input, id: uuid(), created_at: now() };
  const { data, error } = await db.from("clients").insert(client).select().single();
  return unwrap(data as Client, error, "createClient");
}

export async function getClientsByProfessional(professionalId: string): Promise<Client[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase error (getClientsByProfessional): ${error.message}`);
  return (data as Client[]) ?? [];
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase error (getClientById): ${error.message}`);
  return (data as Client) ?? undefined;
}

// --- Diagnostics ----------------------------------------------------------

export async function createDiagnostic(
  input: Omit<Diagnostic, "id" | "created_at" | "updated_at">
): Promise<Diagnostic> {
  const db = getSupabaseAdmin();
  const timestamp = now();
  const diagnostic: Diagnostic = { ...input, id: uuid(), created_at: timestamp, updated_at: timestamp };
  const { data, error } = await db.from("diagnostics").insert(diagnostic).select().single();
  return unwrap(data as Diagnostic, error, "createDiagnostic");
}

export async function getDiagnosticById(id: string): Promise<Diagnostic | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("diagnostics").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase error (getDiagnosticById): ${error.message}`);
  return (data as Diagnostic) ?? undefined;
}

export async function getDiagnosticsByProfessional(professionalId: string): Promise<Diagnostic[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("diagnostics")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase error (getDiagnosticsByProfessional): ${error.message}`);
  return (data as Diagnostic[]) ?? [];
}

export async function updateDiagnostic(
  id: string,
  patch: Partial<Diagnostic>
): Promise<Diagnostic | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("diagnostics")
    .update({ ...patch, updated_at: now() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Supabase error (updateDiagnostic): ${error.message}`);
  return (data as Diagnostic) ?? undefined;
}

// --- Packages & payments ----------------------------------------------

export async function getPackages(): Promise<Package[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("packages").select("*").eq("active", true);
  if (error) throw new Error(`Supabase error (getPackages): ${error.message}`);
  return (data as Package[]) ?? [];
}

export async function getPackageById(id: string): Promise<Package | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("packages").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase error (getPackageById): ${error.message}`);
  return (data as Package) ?? undefined;
}

export async function getPaymentOrderById(id: string): Promise<PaymentOrder | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("payment_orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Supabase error (getPaymentOrderById): ${error.message}`);
  return (data as PaymentOrder) ?? undefined;
}

export async function createPaymentOrder(
  input: Omit<PaymentOrder, "id" | "created_at" | "updated_at">
): Promise<PaymentOrder> {
  const db = getSupabaseAdmin();
  const timestamp = now();
  const order: PaymentOrder = { ...input, id: uuid(), created_at: timestamp, updated_at: timestamp };
  const { data, error } = await db.from("payment_orders").insert(order).select().single();
  return unwrap(data as PaymentOrder, error, "createPaymentOrder");
}

export async function updatePaymentOrder(
  id: string,
  patch: Partial<PaymentOrder>
): Promise<PaymentOrder | undefined> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("payment_orders")
    .update({ ...patch, updated_at: now() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Supabase error (updatePaymentOrder): ${error.message}`);
  return (data as PaymentOrder) ?? undefined;
}

export async function getPaymentOrdersByProfessional(professionalId: string): Promise<PaymentOrder[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("payment_orders")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase error (getPaymentOrdersByProfessional): ${error.message}`);
  return (data as PaymentOrder[]) ?? [];
}

export async function grantPackageCredits(
  professionalId: string,
  pkg: Package,
  reference?: string
): Promise<void> {
  if (pkg.unlimited) {
    await updateProfile(professionalId, { plan_type: "unlimited", plan_status: "active" });
  } else {
    await updateProfile(professionalId, { plan_type: "credits" });
  }
  await adjustCredits(
    professionalId,
    pkg.unlimited ? 0 : pkg.credits,
    "purchase",
    reference ? `Compra do pacote ${pkg.name} (${reference})` : `Compra do pacote ${pkg.name}`
  );
}

export async function wasPaymentAlreadyProcessed(
  professionalId: string,
  reference: string
): Promise<boolean> {
  const transactions = await getTransactions(professionalId);
  return transactions.some((t) => t.description.includes(reference));
}
