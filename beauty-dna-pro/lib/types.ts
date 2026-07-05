export type PlanType = "free" | "credits" | "unlimited";
export type PlanStatus = "active" | "inactive";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  professional_name: string;
  email: string;
  password_hash: string;
  whatsapp: string;
  city: string;
  state: string;
  instagram?: string;
  brand_name?: string;
  brand_color?: string;
  logo_url?: string;
  default_message: string;
  slug: string;
  credits_available: number;
  free_credits_used: number;
  plan_type: PlanType;
  plan_status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  professional_id: string;
  name: string;
  whatsapp: string;
  email?: string;
  age?: number;
  city?: string;
  instagram?: string;
  created_at: string;
}

export type DiagnosticStatus =
  | "aguardando_cliente"
  | "concluido"
  | "cancelado";

export type ServiceType =
  | "maquiagem"
  | "penteado"
  | "maquiagem_penteado"
  | "nao_sei";

export interface DiagnosticAnswers {
  servico?: ServiceType;
  ocasiao?: string;
  imagem_desejada?: string;
  makeup?: Record<string, string>;
  hair?: Record<string, string>;
}

export interface MakeupDna {
  codigo: string;
  temperatura_provavel: string;
  contraste: string;
  intensidade: string;
  estilo_dominante: string;
  tipo_pele: string;
  acabamento_ideal: string;
  subtom_base_provavel: string;
  cobertura_recomendada: string;
  blush_recomendado: string[];
  batons_recomendados: string[];
  sombras_recomendadas: string[];
  cores_a_evitar: string[];
  make_assinatura: string;
}

export interface HairDna {
  codigo: string;
  penteados_indicados: string[];
  penteados_a_evitar: string[];
}

export interface LookDna {
  codigo: string;
  resumo_executivo: string;
  o_que_valoriza: string[];
  o_que_evitar: string[];
  checklist_execucao: string[];
  resumo_whatsapp: string;
}

export interface DiagnosticResult {
  makeup_dna: MakeupDna;
  hair_dna: HairDna | null;
  look_dna: LookDna;
}

export interface Diagnostic {
  id: string;
  professional_id: string;
  client_id: string;
  status: DiagnosticStatus;
  service_type: ServiceType | null;
  occasion: string | null;
  desired_image: string | null;
  appointment_date: string | null;
  consent_accepted: boolean;
  photo_front_url: string | null;
  photo_side_url: string | null;
  makeup_reference_url: string | null;
  hair_reference_url: string | null;
  outfit_reference_url: string | null;
  answers_json: DiagnosticAnswers | null;
  result_json: DiagnosticResult | null;
  edited_result_json: DiagnosticResult | null;
  whatsapp_summary: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionType = "grant_free" | "purchase" | "consume" | "refund";

export interface CreditTransaction {
  id: string;
  professional_id: string;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  diagnostic_id?: string | null;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  credits: number;
  price: number;
  active: boolean;
  unlimited?: boolean;
  period?: "mensal";
  created_at: string;
}

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PaymentOrder {
  id: string;
  professional_id: string;
  package_id: string;
  provider: "mock" | "mercado_pago";
  status: PaymentStatus;
  amount: number;
  credits: number;
  checkout_url: string | null;
  created_at: string;
  updated_at: string;
}
