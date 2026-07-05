import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import type {
  Profile,
  Client,
  Diagnostic,
  CreditTransaction,
  Package,
  PaymentOrder,
} from "./types";

// ---------------------------------------------------------------------------
// MOCK DATA LAYER
// ---------------------------------------------------------------------------
// This module is the single point of contact with "the database" for the
// entire app. Every page/API route imports from here, never from a JSON file
// directly. That means swapping this file's internals for real Supabase
// calls (see supabase/schema.sql for the matching table definitions) later
// will not require touching any page component.
// ---------------------------------------------------------------------------

interface DbShape {
  profiles: Profile[];
  clients: Client[];
  diagnostics: Diagnostic[];
  credit_transactions: CreditTransaction[];
  packages: Package[];
  payment_orders: PaymentOrder[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_PACKAGES: Package[] = [
  {
    id: "pkg-essencial",
    name: "Essencial",
    credits: 10,
    price: 29.9,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "pkg-profissional",
    name: "Profissional",
    credits: 30,
    price: 59.9,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "pkg-studio",
    name: "Studio",
    credits: 100,
    price: 127.0,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "pkg-ilimitado",
    name: "Ilimitado mensal",
    credits: 999999,
    price: 97.0,
    active: true,
    unlimited: true,
    period: "mensal",
    created_at: new Date().toISOString(),
  },
];

function ensureDb(): DbShape {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DbShape = {
      profiles: [],
      clients: [],
      diagnostics: [],
      credit_transactions: [],
      packages: DEFAULT_PACKAGES,
      payment_orders: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const parsed = JSON.parse(raw) as DbShape;
  if (!parsed.packages || parsed.packages.length === 0) {
    parsed.packages = DEFAULT_PACKAGES;
  }
  return parsed;
}

function save(db: DbShape) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function now() {
  return new Date().toISOString();
}

// --- Profiles ---------------------------------------------------------

export function createProfile(
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
): Profile {
  const db = ensureDb();
  const id = uuid();
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
    created_at: now(),
    updated_at: now(),
  };
  db.profiles.push(profile);
  db.credit_transactions.push({
    id: uuid(),
    professional_id: id,
    transaction_type: "grant_free",
    amount: 3,
    description: "3 diagnósticos grátis de boas-vindas",
    created_at: now(),
  });
  save(db);
  return profile;
}

export function getProfileById(id: string): Profile | undefined {
  return ensureDb().profiles.find((p) => p.id === id);
}

export function getProfileByEmail(email: string): Profile | undefined {
  return ensureDb().profiles.find(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );
}

export function getProfileBySlug(slug: string): Profile | undefined {
  return ensureDb().profiles.find((p) => p.slug === slug);
}

export function slugExists(slug: string): boolean {
  return ensureDb().profiles.some((p) => p.slug === slug);
}

export function updateProfile(
  id: string,
  patch: Partial<Profile>
): Profile | undefined {
  const db = ensureDb();
  const idx = db.profiles.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  db.profiles[idx] = { ...db.profiles[idx], ...patch, updated_at: now() };
  save(db);
  return db.profiles[idx];
}

export function adjustCredits(
  professionalId: string,
  amount: number,
  type: CreditTransaction["transaction_type"],
  description: string,
  diagnosticId?: string
): Profile | undefined {
  const db = ensureDb();
  const idx = db.profiles.findIndex((p) => p.id === professionalId);
  if (idx === -1) return undefined;
  db.profiles[idx].credits_available += amount;
  db.profiles[idx].updated_at = now();
  db.credit_transactions.push({
    id: uuid(),
    professional_id: professionalId,
    transaction_type: type,
    amount,
    description,
    diagnostic_id: diagnosticId ?? null,
    created_at: now(),
  });
  save(db);
  return db.profiles[idx];
}

export function getTransactions(professionalId: string): CreditTransaction[] {
  return ensureDb()
    .credit_transactions.filter((t) => t.professional_id === professionalId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

// --- Clients ------------------------------------------------------------

export function createClient(
  input: Omit<Client, "id" | "created_at">
): Client {
  const db = ensureDb();
  const client: Client = { ...input, id: uuid(), created_at: now() };
  db.clients.push(client);
  save(db);
  return client;
}

export function getClientsByProfessional(professionalId: string): Client[] {
  return ensureDb()
    .clients.filter((c) => c.professional_id === professionalId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getClientById(id: string): Client | undefined {
  return ensureDb().clients.find((c) => c.id === id);
}

// --- Diagnostics ----------------------------------------------------------

export function createDiagnostic(
  input: Omit<Diagnostic, "id" | "created_at" | "updated_at">
): Diagnostic {
  const db = ensureDb();
  const diagnostic: Diagnostic = {
    ...input,
    id: uuid(),
    created_at: now(),
    updated_at: now(),
  };
  db.diagnostics.push(diagnostic);
  save(db);
  return diagnostic;
}

export function getDiagnosticById(id: string): Diagnostic | undefined {
  return ensureDb().diagnostics.find((d) => d.id === id);
}

export function getDiagnosticsByProfessional(
  professionalId: string
): Diagnostic[] {
  return ensureDb()
    .diagnostics.filter((d) => d.professional_id === professionalId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function updateDiagnostic(
  id: string,
  patch: Partial<Diagnostic>
): Diagnostic | undefined {
  const db = ensureDb();
  const idx = db.diagnostics.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  db.diagnostics[idx] = { ...db.diagnostics[idx], ...patch, updated_at: now() };
  save(db);
  return db.diagnostics[idx];
}

// --- Packages & payments ----------------------------------------------

export function getPackages(): Package[] {
  return ensureDb().packages.filter((p) => p.active);
}

export function getPackageById(id: string): Package | undefined {
  return ensureDb().packages.find((p) => p.id === id);
}

export function createPaymentOrder(
  input: Omit<PaymentOrder, "id" | "created_at" | "updated_at">
): PaymentOrder {
  const db = ensureDb();
  const order: PaymentOrder = {
    ...input,
    id: uuid(),
    created_at: now(),
    updated_at: now(),
  };
  db.payment_orders.push(order);
  save(db);
  return order;
}

export function updatePaymentOrder(
  id: string,
  patch: Partial<PaymentOrder>
): PaymentOrder | undefined {
  const db = ensureDb();
  const idx = db.payment_orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  db.payment_orders[idx] = {
    ...db.payment_orders[idx],
    ...patch,
    updated_at: now(),
  };
  save(db);
  return db.payment_orders[idx];
}

export function getPaymentOrdersByProfessional(
  professionalId: string
): PaymentOrder[] {
  return ensureDb()
    .payment_orders.filter((o) => o.professional_id === professionalId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
