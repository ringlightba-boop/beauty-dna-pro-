import type {
  DiagnosticAnswers,
  DiagnosticResult,
  HairDna,
  LookDna,
  MakeupDna,
  ServiceType,
} from "./types";

// ---------------------------------------------------------------------------
// This engine is intentionally 100% rule-based (no computer vision, no LLM
// calls). The uploaded photo is treated purely as a visual support asset for
// the professional — it never feeds into this logic. All directional
// language uses "tendência" / "provável" / "direção indicada" per the
// product's editorial rules, and every field can be overridden later in the
// report editor.
// ---------------------------------------------------------------------------

type Temp = "quente" | "neutra-quente" | "neutra" | "neutra-fria" | "fria";

function cap(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function pick<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

function dedup(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

// --- Temperature scoring ---------------------------------------------------

function computeTemperature(m: Record<string, string>): {
  temp: Temp;
  score: number;
} {
  let score = 0; // positive => quente, negative => frio

  switch (m.m6_acessorios) {
    case "Dourados":
      score += 2;
      break;
    case "Prateados":
      score -= 2;
      break;
  }

  switch (m.m7_batom_coral) {
    case "Bonita":
      score += 2;
      break;
    case "Apagada":
      score -= 2;
      break;
    case "Depende":
      score += 0.5;
      break;
  }

  switch (m.m8_batom_frio) {
    case "Elegante":
      score -= 2;
      break;
    case "Pesada":
      score += 2;
      break;
  }

  switch (m.m5_base_tende) {
    case "Amarelada":
    case "Alaranjada":
      score += 1.5;
      break;
    case "Rosada":
      score -= 1.5;
      break;
    case "Acinzentada":
      score -= 1;
      break;
  }

  let temp: Temp = "neutra";
  if (score >= 3) temp = "quente";
  else if (score <= -3) temp = "fria";
  else if (score > 0) temp = "neutra-quente";
  else if (score < 0) temp = "neutra-fria";

  return { temp, score };
}

function tempAdjective(temp: Temp): string {
  switch (temp) {
    case "quente":
      return "Quente";
    case "fria":
      return "Frio";
    default:
      return "Neutro";
  }
}

function tempLabel(temp: Temp): string {
  switch (temp) {
    case "quente":
      return "quente";
    case "fria":
      return "fria/neutra-fria";
    case "neutra-quente":
      return "neutra com leve tendência quente";
    case "neutra-fria":
      return "neutra com leve tendência fria";
    default:
      return "neutra";
  }
}

// --- Palettes by temperature bucket -----------------------------------

const PALETTES: Record<
  Temp,
  { blush: string[]; batom: string[]; sombra: string[]; evitar: string[] }
> = {
  quente: {
    blush: ["pêssego", "coral suave", "terracota claro"],
    batom: ["terracota", "coral suave", "nude quente"],
    sombra: ["marrom dourado", "cobre suave", "caramelo"],
    evitar: ["rosa choque frio", "roxo azulado intenso", "cinza gelado"],
  },
  "neutra-quente": {
    blush: ["pêssego rosado", "terracota suave", "rosa amadeirado"],
    batom: ["nude amadeirado", "terracota suave", "rosa queimado quente"],
    sombra: ["bronze suave", "marrom quente", "caramelo acinzentado"],
    evitar: ["laranja vibrante", "roxo frio intenso"],
  },
  neutra: {
    blush: ["rosa amadeirado", "nude suave", "pêssego claro"],
    batom: ["nude", "rosa suave", "terracota claro"],
    sombra: ["marrom neutro", "taupe", "bege acinzentado"],
    evitar: ["tons muito saturados fora do seu contraste natural"],
  },
  "neutra-fria": {
    blush: ["rosa suave", "malva claro", "nude rosado"],
    batom: ["rosa nude", "malva", "vinho suave"],
    sombra: ["taupe rosado", "cinza amadeirado", "marrom neutro"],
    evitar: ["laranja forte", "dourado intenso"],
  },
  fria: {
    blush: ["rosa queimado", "malva", "berry suave"],
    batom: ["nude rosado", "malva", "rosa queimado"],
    sombra: ["taupe", "marrom frio", "grafite suave"],
    evitar: ["laranja intenso", "dourado amarelo", "coral muito quente"],
  },
};

function personalizeLipstick(temp: Temp, m14: string | undefined): string[] {
  const base = PALETTES[temp].batom;
  const cool = temp === "fria" || temp === "neutra-fria";
  const warm = temp === "quente" || temp === "neutra-quente";

  const hueMap: Record<string, string> = {
    Nude: warm ? "nude quente" : cool ? "nude rosado" : "nude",
    Rosa: warm ? "rosa pêssego" : cool ? "rosa queimado" : "rosa amadeirado",
    Vermelho: warm
      ? "vermelho alaranjado"
      : cool
      ? "vermelho azulado (cereja)"
      : "vermelho clássico",
    Vinho: cool ? "vinho" : warm ? "vinho amadeirado" : "vinho suave",
    Marrom: warm ? "marrom terracota" : cool ? "marrom frio" : "marrom neutro",
    Gloss: `${base[0]} com acabamento em gloss`,
  };

  const personal = m14 ? hueMap[m14] : undefined;
  let list = personal ? [personal, ...base] : [...base];

  if (m14 === "Não gosto de batom forte") {
    list = list.filter((l) => !/vinho$|vermelho/i.test(l));
    list.unshift(warm ? "nude quente" : cool ? "nude rosado" : "nude");
  }
  if (m14 === "Amo batom marcante") {
    list.unshift(cool ? "vinho" : warm ? "terracota intenso" : "vermelho clássico");
  }

  return pick(dedup(list), 3);
}

// --- Makeup DNA -------------------------------------------------------

function computeIntensidade(m: Record<string, string>): string {
  const direct = m.m1_intensidade;
  if (direct && direct !== "Ainda não sei") return direct.toLowerCase();

  const percepcao = m.m18_percepcao_desejada;
  if (["Poderosa", "Confiante", "Sofisticada"].includes(percepcao ?? ""))
    return "marcante";
  if (["Delicada", "Natural", "Acessível"].includes(percepcao ?? ""))
    return "leve";
  return "média";
}

function intensidadeFrase(intensidade: string): string {
  const map: Record<string, string> = {
    leve: "Presença Suave",
    média: "Presença Equilibrada",
    marcante: "Presença Marcante",
    "muito marcante": "Presença Intensa",
  };
  return map[intensidade] ?? "Presença Equilibrada";
}

function computeAcabamento(m: Record<string, string>, intensidade: string): string {
  const direct = m.m2_acabamento;
  let finish = "semi-matte";
  if (direct && direct !== "Não sei") {
    finish = direct.toLowerCase();
  } else {
    const skin = m.m4_tipo_pele;
    if (skin === "Oleosa") finish = "matte";
    else if (skin === "Seca") finish = "glow";
    else if (skin === "Sensível") finish = "semi-matte";
    else finish = "semi-matte";
  }
  const qualifier = intensidade === "marcante" || intensidade === "muito marcante"
    ? "polido"
    : "natural";
  return `${finish} ${qualifier}`;
}

function buildMakeAssinatura(
  acabamento: string,
  blush: string,
  sombra: string,
  batom: string
): string {
  return `Pele ${acabamento}, olhos construídos em tons ${sombra}, blush ${blush} e boca finalizada em ${batom}.`;
}

export function buildMakeupDna(
  imagemDesejada: string | undefined,
  m: Record<string, string>
): MakeupDna {
  const { temp } = computeTemperature(m);
  const contraste = (m.m10_contraste && m.m10_contraste !== "Não sei"
    ? m.m10_contraste
    : "médio"
  ).toLowerCase();
  const intensidade = computeIntensidade(m);
  const estilo = (imagemDesejada || m.m18_percepcao_desejada || "Elegante").toLowerCase();
  const tipoPele = (m.m4_tipo_pele && m.m4_tipo_pele !== "Não sei"
    ? m.m4_tipo_pele
    : "mista"
  ).toLowerCase();
  const cobertura = (m.m3_cobertura && m.m3_cobertura !== "Não sei"
    ? m.m3_cobertura
    : "média"
  ).toLowerCase();

  const acabamento = computeAcabamento(m, intensidade);
  const palette = PALETTES[temp];
  const batons = personalizeLipstick(temp, m.m14_batom_preferido);
  const blush = pick(dedup(palette.blush), 3);
  const sombras = pick(dedup(palette.sombra), 3);
  const evitar = pick(dedup(palette.evitar), 3);

  const codigo = `${cap(estilo)} ${tempAdjective(temp)} de ${intensidadeFrase(
    intensidade
  )}`;

  const subtom = temp.replace("neutra", "neutro").replace("quente", "quente").replace("fria", "frio");

  return {
    codigo,
    temperatura_provavel: tempLabel(temp),
    contraste,
    intensidade,
    estilo_dominante: estilo,
    tipo_pele: tipoPele,
    acabamento_ideal: acabamento,
    subtom_base_provavel: subtom || "neutro",
    cobertura_recomendada: cobertura,
    blush_recomendado: blush,
    batons_recomendados: batons,
    sombras_recomendadas: sombras,
    cores_a_evitar: evitar,
    make_assinatura: buildMakeAssinatura(acabamento, blush[0], sombras[0], batons[0]),
  };
}

// --- Hair DNA -----------------------------------------------------------

const HAIR_STYLE_SUGGESTIONS: Record<string, string[]> = {
  Clássicos: ["coque baixo alinhado", "rabo de cavalo liso", "penteado com risca lateral definida"],
  Modernos: ["rabo alto texturizado", "half-up com trança fina", "penteado assimétrico"],
  Românticos: ["ondas soltas românticas", "semi-preso com tranças finas", "coque baixo com fios soltos"],
  Naturais: ["solto com ondas naturais", "meio preso simples", "textura natural realçada"],
  Poderosos: ["rabo alto esticado", "coque alto estruturado", "penteado com volume no topo"],
  Delicados: [
    "semi-preso com ondas suaves",
    "coque baixo com mechas frontais discretas",
    "trancinhas delicadas na lateral",
  ],
  Sofisticados: ["coque baixo escultural", "rabo baixo sofisticado", "solto com ondas estruturadas"],
  Despojados: ["rabo baixo desconstruído", "solto com textura despojada", "meio preso descontraído"],
};

const HAIR_AVOID_BY_FEELING: Record<string, string> = {
  "Séria demais": "penteado extremamente rígido e sem movimento",
  Infantil: "presilhas ou detalhes infantilizados",
  Apagada: "penteado sem volume ou sem ponto de luz",
  Exagerada: "volume excessivo ou excesso de acessórios",
  Comum: "penteados muito básicos, sem um toque autoral",
  Dura: "cabelo totalmente colado ao rosto",
  Velha: "penteados muito armados ou datados",
  Desarrumada: "fios soltos em excesso ou aparência despenteada",
};

const HAIR_CODE_ADJECTIVE: Record<string, string> = {
  Clássicos: "Clássico",
  Modernos: "Moderno",
  Românticos: "Romântico",
  Naturais: "Natural",
  Poderosos: "Poderoso",
  Delicados: "Delicado",
  Sofisticados: "Elegante",
  Despojados: "Despojado",
};

const TRANSMITIR_NOUN: Record<string, string> = {
  Elegância: "Elegância Refinada",
  Delicadeza: "Delicadeza Feminina",
  Romantismo: "Feminilidade Romântica",
  Naturalidade: "Naturalidade Autêntica",
  Força: "Presença de Força",
  Sofisticação: "Sofisticação Fluida",
  Modernidade: "Modernidade Fluida",
  Leveza: "Leveza Refinada",
  Feminilidade: "Feminilidade Refinada",
  Autoridade: "Autoridade Serena",
};

export function buildHairDna(h: Record<string, string>): HairDna {
  const estiloKey = h.h7_estilo_penteado ?? "Naturais";
  let indicados = [...(HAIR_STYLE_SUGGESTIONS[estiloKey] ?? HAIR_STYLE_SUGGESTIONS.Naturais)];

  const presoSolto = h.h6_preso_solto;
  if (presoSolto === "Solto") {
    indicados = indicados.filter((i) => /solto|ondas/.test(i)).concat(indicados);
  } else if (presoSolto === "Preso") {
    indicados = indicados.filter((i) => /coque|rabo|preso/.test(i)).concat(indicados);
  } else if (presoSolto === "Semi-preso") {
    indicados = indicados.filter((i) => /semi-preso|meio preso|half-up/.test(i)).concat(indicados);
  }
  indicados = dedup(indicados);

  if (h.h9_mechas_soltas === "Sim, bastante" || h.h9_mechas_soltas === "Sim, discretamente") {
    indicados[0] = `${indicados[0]}, com mechas soltas emoldurando o rosto`;
  }

  const evitar: string[] = [];
  if (h.h11_nao_quer_sentir && HAIR_AVOID_BY_FEELING[h.h11_nao_quer_sentir]) {
    evitar.push(HAIR_AVOID_BY_FEELING[h.h11_nao_quer_sentir]);
  }
  if (h.h8_volume_local === "Mais alinhado" || h.h8_volume_local === "Leve e solto") {
    evitar.push("volume exagerado no topo");
  } else {
    evitar.push("penteado muito rígido");
  }
  evitar.push("cabelo totalmente colado ao rosto");

  const adj = HAIR_CODE_ADJECTIVE[estiloKey] ?? "Elegante";
  const transmitirNoun = h.h10_transmitir
    ? TRANSMITIR_NOUN[h.h10_transmitir] ?? "Feminilidade Refinada"
    : "Feminilidade Refinada";

  return {
    codigo: `${adj} Fluido de ${transmitirNoun}`,
    penteados_indicados: pick(dedup(indicados), 4),
    penteados_a_evitar: pick(dedup(evitar), 3),
  };
}

// --- Look DNA -----------------------------------------------------------

export function buildLookDna(
  imagemDesejada: string | undefined,
  ocasiao: string | undefined,
  makeup: MakeupDna,
  hair: HairDna | null
): LookDna {
  const estilo = cap(imagemDesejada || makeup.estilo_dominante);
  const tempWord =
    makeup.temperatura_provavel.startsWith("quente")
      ? "Quente"
      : makeup.temperatura_provavel.startsWith("fria")
      ? "Fria"
      : "Neutra";

  const codigo = `${estilo}, ${tempWord} e Sofisticada`;

  const resumoExecutivo = `A cliente busca transmitir uma imagem ${estilo.toLowerCase()}${
    ocasiao ? ` para ${ocasiao.toLowerCase()}` : ""
  }, com direção de cor de tendência ${makeup.temperatura_provavel} e intensidade ${makeup.intensidade}. As recomendações abaixo são um ponto de partida orientativo — o tom exato de base e os ajustes finos devem ser definidos durante o atendimento presencial.`;

  const valoriza = dedup([
    `pele com acabamento ${makeup.acabamento_ideal}`,
    `blush em ${makeup.blush_recomendado[0]}`,
    `olhos em tons ${makeup.sombras_recomendadas[0]} / ${makeup.sombras_recomendadas[1] ?? makeup.sombras_recomendadas[0]}`,
    `boca em ${makeup.batons_recomendados[0]}`,
    ...(hair ? [`penteado ${hair.penteados_indicados[0]}`] : []),
  ]);

  const evitar = dedup([
    `tons como ${makeup.cores_a_evitar.join(", ")}`,
    ...(hair ? [hair.penteados_a_evitar[0]] : []),
  ]);

  const checklist = [
    `Preparar a pele conforme o tipo de pele (${makeup.tipo_pele})`,
    `Usar base de cobertura ${makeup.cobertura_recomendada}, com tendência de subtom ${makeup.subtom_base_provavel}`,
    `Aplicar blush em ${makeup.blush_recomendado[0]}`,
    `Construir os olhos em tons ${makeup.sombras_recomendadas.slice(0, 2).join(" e ")}`,
    `Finalizar a boca em ${makeup.batons_recomendados[0]}`,
    ...(hair ? [`Criar o penteado ${hair.penteados_indicados[0]}`] : []),
  ];

  const resumoWhatsapp = `Seu Look DNA é *${codigo}*. A direção indicada é uma maquiagem ${makeup.intensidade}, pele ${makeup.acabamento_ideal}, olhos em tons ${makeup.sombras_recomendadas[0]}, blush ${makeup.blush_recomendado[0]} e boca em ${makeup.batons_recomendados[0]}.${
    hair ? ` Para o cabelo, a sugestão é um penteado ${hair.penteados_indicados[0]}.` : ""
  } Este é um diagnóstico estético orientativo — os ajustes finais serão definidos com você no dia do atendimento. 💛`;

  return {
    codigo,
    resumo_executivo: resumoExecutivo,
    o_que_valoriza: valoriza,
    o_que_evitar: evitar,
    checklist_execucao: checklist,
    resumo_whatsapp: resumoWhatsapp,
  };
}

// --- Entry point ----------------------------------------------------------

export function generateDiagnosticResult(
  answers: DiagnosticAnswers
): DiagnosticResult {
  const makeupAnswers = answers.makeup ?? {};
  const hairAnswers = answers.hair ?? {};
  const includesHair = wantsHair(answers.servico);

  const makeup_dna = buildMakeupDna(answers.imagem_desejada, makeupAnswers);
  const hair_dna = includesHair ? buildHairDna(hairAnswers) : null;
  const look_dna = buildLookDna(
    answers.imagem_desejada,
    answers.ocasiao,
    makeup_dna,
    hair_dna
  );

  return { makeup_dna, hair_dna, look_dna };
}

export function wantsHair(servico: ServiceType | undefined | null): boolean {
  return servico === "penteado" || servico === "maquiagem_penteado";
}
