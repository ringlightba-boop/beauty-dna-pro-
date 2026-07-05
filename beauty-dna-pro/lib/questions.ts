export type QuestionType = "single" | "text";

export interface Question {
  id: string;
  pergunta: string;
  tipo: QuestionType;
  opcoes?: string[];
  placeholder?: string;
}

export const servicoOpcoes = [
  { value: "maquiagem", label: "Somente maquiagem" },
  { value: "penteado", label: "Somente penteado" },
  { value: "maquiagem_penteado", label: "Maquiagem + penteado" },
  { value: "nao_sei", label: "Ainda não sei" },
];

export const ocasiaoOpcoes = [
  "Dia a dia",
  "Trabalho",
  "Evento social",
  "Madrinha",
  "Noiva",
  "Formatura",
  "Culto / evento cristão",
  "Palestra",
  "Ensaio fotográfico",
  "Gravação de vídeos",
  "Outro",
];

export const imagemDesejadaOpcoes = [
  "Elegante",
  "Delicada",
  "Poderosa",
  "Natural",
  "Sofisticada",
  "Jovial",
  "Madura",
  "Criativa",
  "Acessível",
  "Confiante",
  "Romântica",
  "Profissional",
];

export const makeupDnaPerguntas: Question[] = [
  {
    id: "m1_intensidade",
    pergunta: "Você quer uma maquiagem leve, média, marcante, muito marcante ou ainda não sabe?",
    tipo: "single",
    opcoes: ["Leve", "Média", "Marcante", "Muito marcante", "Ainda não sei"],
  },
  {
    id: "m2_acabamento",
    pergunta: "Qual tipo de acabamento de pele você prefere: natural, glow, matte, semi-matte, blindada ou não sabe?",
    tipo: "single",
    opcoes: ["Natural", "Glow", "Matte", "Semi-matte", "Blindada", "Não sei"],
  },
  {
    id: "m3_cobertura",
    pergunta: "Qual cobertura de base prefere: leve, média, alta, depende ou não sabe?",
    tipo: "single",
    opcoes: ["Leve", "Média", "Alta", "Depende", "Não sei"],
  },
  {
    id: "m4_tipo_pele",
    pergunta: "Qual seu tipo de pele: oleosa, seca, mista, normal, sensível ou não sabe?",
    tipo: "single",
    opcoes: ["Oleosa", "Seca", "Mista", "Normal", "Sensível", "Não sei"],
  },
  {
    id: "m5_base_tende",
    pergunta:
      "Sua base costuma ficar amarelada, rosada, acinzentada, alaranjada, clara demais, escura demais, normal ou você não usa base?",
    tipo: "single",
    opcoes: [
      "Amarelada",
      "Rosada",
      "Acinzentada",
      "Alaranjada",
      "Clara demais",
      "Escura demais",
      "Normal",
      "Não uso base",
    ],
  },
  {
    id: "m6_acessorios",
    pergunta: "Você combina mais com acessórios dourados, prateados, os dois ou não sabe?",
    tipo: "single",
    opcoes: ["Dourados", "Prateados", "Os dois", "Não sei"],
  },
  {
    id: "m7_batom_coral",
    pergunta: "Quando usa batom alaranjado/coral, você fica bonita, apagada, depende ou nunca reparou?",
    tipo: "single",
    opcoes: ["Bonita", "Apagada", "Depende", "Nunca reparei"],
  },
  {
    id: "m8_batom_frio",
    pergunta: "Quando usa batom rosa frio, vinho ou malva, você fica elegante, pesada, depende ou nunca reparou?",
    tipo: "single",
    opcoes: ["Elegante", "Pesada", "Depende", "Nunca reparei"],
  },
  {
    id: "m9_preferencia_cor",
    pergunta: "Você prefere cores claras, médias, escuras, vivas ou neutras?",
    tipo: "single",
    opcoes: ["Claras", "Médias", "Escuras", "Vivas", "Neutras"],
  },
  {
    id: "m10_contraste",
    pergunta: "Seu contraste entre cabelo, pele e olhos é baixo, médio, alto ou não sabe?",
    tipo: "single",
    opcoes: ["Baixo", "Médio", "Alto", "Não sei"],
  },
  {
    id: "m11_formato_rosto",
    pergunta: "Seu rosto parece arredondado, oval, alongado, quadrado, triangular, coração ou não sabe?",
    tipo: "single",
    opcoes: ["Arredondado", "Oval", "Alongado", "Quadrado", "Triangular", "Coração", "Não sei"],
  },
  {
    id: "m12_tracos",
    pergunta: "Seus traços parecem suaves, marcantes, equilibrados, angulares, arredondados ou não sabe?",
    tipo: "single",
    opcoes: ["Suaves", "Marcantes", "Equilibrados", "Angulares", "Arredondados", "Não sei"],
  },
  {
    id: "m13_valorizar",
    pergunta: "Qual parte do rosto você gosta de valorizar: olhos, boca, pele, maçãs, sobrancelhas ou não sabe?",
    tipo: "single",
    opcoes: ["Olhos", "Boca", "Pele", "Maçãs do rosto", "Sobrancelhas", "Não sei"],
  },
  {
    id: "m14_batom_preferido",
    pergunta:
      "Você prefere batom nude, rosa, vermelho, vinho, marrom, gloss, não gosta de batom forte ou ama batom marcante?",
    tipo: "single",
    opcoes: [
      "Nude",
      "Rosa",
      "Vermelho",
      "Vinho",
      "Marrom",
      "Gloss",
      "Não gosto de batom forte",
      "Amo batom marcante",
    ],
  },
  {
    id: "m15_olhos",
    pergunta:
      "Sobre olhos, você prefere esfumado leve, esfumado marcante, delineado, cílios destacados, brilho, tons neutros, tons coloridos ou quase nada?",
    tipo: "single",
    opcoes: [
      "Esfumado leve",
      "Esfumado marcante",
      "Delineado",
      "Cílios destacados",
      "Brilho",
      "Tons neutros",
      "Tons coloridos",
      "Quase nada",
    ],
  },
  {
    id: "m16_menos_gosta",
    pergunta: "Qual maquiagem você menos gosta: pesada, apagada, brilhosa, colorida, simples, marcada ou não sabe?",
    tipo: "single",
    opcoes: ["Pesada", "Apagada", "Brilhosa", "Colorida", "Simples", "Marcada", "Não sei"],
  },
  {
    id: "m17_descricao_pessoas",
    pergunta:
      "Como as pessoas costumam te descrever: comunicativa, calma, intensa, reservada, elegante, prática, criativa, doce, forte ou sensível?",
    tipo: "single",
    opcoes: [
      "Comunicativa",
      "Calma",
      "Intensa",
      "Reservada",
      "Elegante",
      "Prática",
      "Criativa",
      "Doce",
      "Forte",
      "Sensível",
    ],
  },
  {
    id: "m18_percepcao_desejada",
    pergunta:
      "Você prefere ser percebida como acessível, sofisticada, poderosa, leve, romântica, moderna, clássica, autêntica, segura ou delicada?",
    tipo: "single",
    opcoes: [
      "Acessível",
      "Sofisticada",
      "Poderosa",
      "Leve",
      "Romântica",
      "Moderna",
      "Clássica",
      "Autêntica",
      "Segura",
      "Delicada",
    ],
  },
  {
    id: "m19_restricao",
    pergunta:
      "Você tem alguma restrição: pele sensível, alergia, não gosta de cílios postiços, não gosta de glitter, não gosta de batom forte, não gosta de pele pesada, nenhuma ou outra?",
    tipo: "single",
    opcoes: [
      "Pele sensível",
      "Alergia",
      "Não gosto de cílios postiços",
      "Não gosto de glitter",
      "Não gosto de batom forte",
      "Não gosto de pele pesada",
      "Nenhuma",
      "Outra",
    ],
  },
  {
    id: "m20_tom_base",
    pergunta: "Qual tom de base você costuma usar?",
    tipo: "text",
    placeholder: "Ex: 220 Natural, D30, ou marca/nome do tom",
  },
];

export const hairDnaPerguntas: Question[] = [
  {
    id: "h1_comprimento",
    pergunta: "Qual o comprimento do seu cabelo?",
    tipo: "single",
    opcoes: ["Curto", "Médio", "Longo"],
  },
  {
    id: "h2_tipo",
    pergunta: "Qual o tipo do seu cabelo?",
    tipo: "single",
    opcoes: ["Liso", "Ondulado", "Cacheado", "Crespo", "Misto"],
  },
  {
    id: "h3_volume",
    pergunta: "Como é o volume do seu cabelo?",
    tipo: "single",
    opcoes: ["Pouco", "Médio", "Muito"],
  },
  {
    id: "h4_fio",
    pergunta: "Como é o fio do seu cabelo?",
    tipo: "single",
    opcoes: ["Fino", "Médio", "Grosso", "Não sei"],
  },
  {
    id: "h5_alongamento",
    pergunta: "Você usa alongamento ou aplique?",
    tipo: "single",
    opcoes: ["Sim", "Não", "Às vezes"],
  },
  {
    id: "h6_preso_solto",
    pergunta: "Você se sente mais bonita com cabelo preso, semi-preso, solto, depende ou não sabe?",
    tipo: "single",
    opcoes: ["Preso", "Semi-preso", "Solto", "Depende", "Não sei"],
  },
  {
    id: "h7_estilo_penteado",
    pergunta:
      "Você prefere penteados clássicos, modernos, românticos, naturais, poderosos, delicados, sofisticados ou despojados?",
    tipo: "single",
    opcoes: [
      "Clássicos",
      "Modernos",
      "Românticos",
      "Naturais",
      "Poderosos",
      "Delicados",
      "Sofisticados",
      "Despojados",
    ],
  },
  {
    id: "h8_volume_local",
    pergunta: "Você gosta de volume no topo, lateral, geral, mais alinhado, leve e solto ou não sabe?",
    tipo: "single",
    opcoes: ["Topo", "Lateral", "Geral", "Mais alinhado", "Leve e solto", "Não sei"],
  },
  {
    id: "h9_mechas_soltas",
    pergunta: "Você gosta de mechas soltas na frente?",
    tipo: "single",
    opcoes: ["Sim, bastante", "Sim, discretamente", "Não", "Depende"],
  },
  {
    id: "h10_transmitir",
    pergunta:
      "O que você quer transmitir com o penteado: elegância, delicadeza, romantismo, naturalidade, força, sofisticação, modernidade, leveza, feminilidade ou autoridade?",
    tipo: "single",
    opcoes: [
      "Elegância",
      "Delicadeza",
      "Romantismo",
      "Naturalidade",
      "Força",
      "Sofisticação",
      "Modernidade",
      "Leveza",
      "Feminilidade",
      "Autoridade",
    ],
  },
  {
    id: "h11_nao_quer_sentir",
    pergunta: "Como você não quer se sentir: séria demais, infantil, apagada, exagerada, comum, dura, velha ou desarrumada?",
    tipo: "single",
    opcoes: ["Séria demais", "Infantil", "Apagada", "Exagerada", "Comum", "Dura", "Velha", "Desarrumada"],
  },
  {
    id: "h12_duracao",
    pergunta: "Quanto tempo você espera que o penteado dure?",
    tipo: "single",
    opcoes: ["Poucas horas", "Meio período", "O dia inteiro", "Evento inteiro"],
  },
  {
    id: "h13_imagem_conjunta",
    pergunta:
      "Você quer que maquiagem e cabelo transmitam uma imagem elegante, romântica, leve, poderosa, natural, sofisticada, moderna ou clássica?",
    tipo: "single",
    opcoes: ["Elegante", "Romântica", "Leve", "Poderosa", "Natural", "Sofisticada", "Moderna", "Clássica"],
  },
  {
    id: "h14_protagonismo",
    pergunta:
      "Você prefere que o cabelo complemente a maquiagem, tenha presença igual ou seja o ponto principal do visual?",
    tipo: "single",
    opcoes: ["Complemente a maquiagem", "Tenha presença igual", "Seja o ponto principal do visual"],
  },
];
