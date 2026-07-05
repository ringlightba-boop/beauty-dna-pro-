# Beauty DNA Pro AI — MVP

Plataforma SaaS para maquiadoras enviarem um diagnóstico inteligente (Look DNA
Report) para suas clientes antes do atendimento.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase
(Postgres)**. O pagamento por créditos já suporta o **Mercado Pago Checkout
Pro** (opcional — sem credenciais configuradas, cai automaticamente em modo
simulado).

---

## 1. Como rodar

Este projeto **precisa de um projeto Supabase** para funcionar (é onde os
dados — contas, clientes, diagnósticos, créditos — ficam guardados de forma
permanente). Sem isso configurado, o site sobe mas as páginas que dependem de
dados mostram erro.

```bash
npm install
npm run dev
```

Variáveis de ambiente obrigatórias (veja `.env.example`):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Passo a passo para obtê-las e configurar o banco está na seção 6.

Fluxo rápido para testar (depois do Supabase configurado):

1. Crie uma conta em `/cadastro` → você ganha 3 créditos e um link tipo
   `/d/seu-nome`.
2. Abra o link em uma aba anônima (simulando a cliente), aceite o
   consentimento e preencha o questionário.
3. Volte ao painel (`/painel/diagnosticos`) — o relatório completo (Makeup
   DNA / Hair DNA / Look DNA) já estará lá, editável, com PDF e resumo de
   WhatsApp.

## 2. Arquitetura

```
app/
  page.tsx                     → landing page pública
  cadastro/, login/            → auth da maquiadora
  d/[slug]/                    → link público da cliente (questionário)
  painel/                      → área logada da maquiadora (protegida)
    page.tsx                   → dashboard
    clientes/                  → lista de clientes
    novo-diagnostico/          → checa créditos + link para enviar
    diagnosticos/[id]/         → relatório (pendente OU editor completo)
    link/                      → "Meu Link"
    pacotes/                   → créditos e planos (pagamento simulado)
    configuracoes/             → perfil da profissional
  api/                         → mutações (signup, login, diagnostics, pagamento)

components/
  ui/            → primitivos (ChoicePill, SwatchProgress, CreditBadge)
  public/        → Navbar/Footer da landing
  painel/        → Sidebar, editor de relatório, cards de link/pacotes
  cliente/       → wizard do questionário, upload de foto, renderer de perguntas

lib/
  types.ts               → tipos que espelham as tabelas do banco
  db.ts                  → camada de dados, hoje 100% Supabase (Postgres)
  supabase/admin.ts      → cliente Supabase server-only (chave service_role)
  auth.ts                → sessão via cookie + senha com hash (bcrypt) — auth própria, não usa Supabase Auth
  mercadopago.ts         → integração real com Checkout Pro (com fallback simulado se não configurado)
  diagnostic-engine.ts   → motor de regras que gera Makeup/Hair/Look DNA
  questions.ts           → conteúdo completo dos questionários
  pdf.ts                 → geração do PDF (jsPDF, roda no navegador)
  utils.ts, get-base-url.ts

supabase/schema.sql      → schema real (tabelas + RLS) — rode isso no seu projeto Supabase
```

### Por que uma camada de dados separada?

Todo acesso a dados passa por `lib/db.ts` — nenhuma página ou componente
consulta o Supabase diretamente. Isso deixa a lógica de acesso centralizada
num único lugar, mais fácil de auditar e trocar no futuro (por exemplo, se um
dia fizer sentido separar leitura/escrita, adicionar cache, etc.).

A autenticação é própria (cookie de sessão + `bcryptjs`), não Supabase Auth —
o acesso ao Postgres é feito via chave **service_role** (acesso total,
usada só no servidor) porque quem já decide "isso pertence a esta
profissional" é o código em `lib/db.ts`/`lib/auth.ts`, filtrando sempre por
`professional_id`. As políticas de RLS no schema ficam como reforço futuro,
caso um dia o app passe a acessar o Supabase também direto do navegador.

### Motor de diagnóstico (sem IA real)

`lib/diagnostic-engine.ts` é 100% determinístico: calcula uma pontuação de
temperatura de cor (quente/frio/neutro) a partir das respostas sobre
acessórios, batom e comportamento da base, cruza com contraste, intensidade e
estilo desejado, e monta os três blocos do relatório. A foto enviada **nunca**
é processada por esse motor — ela é apenas um anexo visual para a
profissional, exatamente como pedido no briefing. Toda a linguagem usa
"tendência", "provável" e "direção indicada" para evitar prometer um tom exato
de base ou fazer qualquer leitura clínica/de personalidade.

## 3. O que ainda é simplificado

| Área | Estado atual |
|---|---|
| Banco de dados | **Supabase Postgres, real e permanente.** Schema em `supabase/schema.sql`. |
| Autenticação | Cookie de sessão própria + senha com hash (`bcryptjs`), guardada em `profiles.password_hash` no Supabase. |
| Fotos | Ainda salvas como data URL dentro do próprio registro do diagnóstico (não em Supabase Storage). Funciona, mas deixa as linhas da tabela `diagnostics` mais pesadas do que precisam. Fica como próxima melhoria natural. |
| Pagamento | **Mercado Pago Checkout Pro real**, se `MERCADOPAGO_ACCESS_TOKEN` estiver configurado. Sem essa variável, cai automaticamente no modo simulado (aprova na hora) — útil para testar o resto do app sem depender do Mercado Pago. |

## 4. Sistema de créditos

- Toda conta nova recebe **3 créditos grátis** (`grant_free` em
  `credit_transactions`).
- O crédito só é descontado quando a **cliente conclui** o questionário
  (rota `complete`), nunca ao apenas iniciar.
- Se a profissional estiver sem créditos no momento em que a cliente tenta
  concluir, as respostas da cliente **não se perdem**: ficam salvas como
  diagnóstico pendente, e a cliente vê uma mensagem tranquila pedindo para
  aguardar. A profissional é redirecionada para `/painel/pacotes` ao tentar
  iniciar um novo diagnóstico sem saldo.

## 5. Segurança (nível MVP)

- Todas as rotas de `/painel` são protegidas no `layout.tsx` (redirect para
  `/login` sem sessão).
- Toda consulta em `lib/db.ts` usada pelo painel é filtrada por
  `professional_id` da sessão atual — uma maquiadora nunca vê dados de outra.
- Nenhuma chave de IA é usada (o motor é local), então não há segredo para
  vazar no frontend.
- Consentimento é obrigatório antes do upload de foto (bloqueado tanto na
  UI quanto na API `/api/diagnostics/start`).
- Avisos de "diagnóstico estético e orientativo" aparecem no consentimento,
  no editor do relatório e no rodapé do PDF.

## 6. Configurando o Supabase

1. Crie uma conta gratuita em **supabase.com** e um novo projeto (escolha uma
   senha de banco de dados forte — guarde-a, mas ela não é usada por este
   app diretamente).
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole todo o
   conteúdo de `supabase/schema.sql` deste projeto e clique em **Run**. Isso
   cria as 6 tabelas e já cadastra os pacotes de crédito.
3. Vá em **Settings → API**. Copie:
   - **Project URL** → variável `SUPABASE_URL`
   - **service_role** (na seção "Project API keys" — é a chave secreta, não
     a "anon/public") → variável `SUPABASE_SERVICE_ROLE_KEY`
4. Configure essas duas variáveis no seu ambiente (no Render: Settings →
   Environment → Add Environment Variable, uma para cada).

A partir daí, os dados passam a ser permanentes — sobrevivem a redeploys,
reinícios por inatividade, e a quantas atualizações de código você quiser
fazer.

## 7. Limitações conhecidas do MVP

- Fotos ainda são guardadas como texto (base64) dentro da própria linha do
  diagnóstico — funciona, mas migrar para Supabase Storage deixaria o banco
  mais leve e as fotos mais fáceis de servir/otimizar.
- `npm audit` aponta vulnerabilidades em transitivas do Next.js/jsPDF que só
  são corrigidas com upgrades de major version (Next 16, jsPDF 4). Não foram
  aplicadas aqui para não arriscar breaking changes num MVP recém-entregue —
  vale revisar antes de ir para produção.
- PDF é gerado no navegador (jsPDF) e não fica salvo em storage — o campo
  `pdf_url` existe no schema para quando isso for persistido.
- `adjustCredits` faz "ler saldo → calcular → gravar" em duas etapas (sem
  transação atômica no Postgres). Para o volume de uso de um MVP isso é
  seguro; numa escala maior, valeria mover para uma função SQL (`rpc`) que
  incrementa o saldo atomicamente.
