export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/-+/g, "");
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function onlyDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function whatsappLink(rawPhone: string, message: string): string {
  const digits = onlyDigits(rawPhone);
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function clientLinkPath(slug: string): string {
  return `/d/${slug}`;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    aguardando_cliente: "Aguardando cliente",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

export function serviceLabel(service: string | null): string {
  const map: Record<string, string> = {
    maquiagem: "Somente maquiagem",
    penteado: "Somente penteado",
    maquiagem_penteado: "Maquiagem + penteado",
    nao_sei: "Ainda não sei",
  };
  return service ? map[service] ?? service : "—";
}
