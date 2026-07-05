# Beauty DNA Pro AI — MVP

Plataforma SaaS para maquiadoras enviarem um diagnóstico inteligente (Look DNA
Report) para suas clientes antes do atendimento.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS**. Rodando hoje
sobre uma **camada de dados mock** (arquivo JSON local), com o schema SQL e os
pontos de integração já preparados para **Supabase** (auth, banco, storage) e
para o **Mercado Pago Checkout Pro**.

---

## 1. Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Não é necessário configurar nenhuma variável
de ambiente para rodar o MVP — os dados ficam em `.data/db.json`, criado
automaticamente na primeira execução (apagar esse arquivo reseta o banco).

Fluxo rápido para testar:

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
  db.ts                  → camada de dados (hoje: JSON local em .data/db.json)
  auth.ts                → sessão via cookie (hoje: mock; trocar por Supabase Auth)
  diagnostic-engine.ts   → motor de regras que gera Makeup/Hair/Look DNA
  questions.ts           → conteúdo completo dos questionários
  pdf.ts                 → geração do PDF (jsPDF, roda no navegador)
  utils.ts, get-base-url.ts

supabase/schema.sql      → schema real (tabelas + RLS) para quando for migrar
```

### Por que uma camada de dados mock?

Todo acesso a dados passa por `lib/db.ts` — nenhuma página ou componente lê
o arquivo JSON diretamente. Isso significa que migrar para Supabase é
reimplementar as funções desse arquivo (mesma assinatura) usando
`@supabase/supabase-js`, sem tocar em nenhuma tela.

### Motor de diagnóstico (sem IA real)

`lib/diagnostic-engine.ts` é 100% determinístico: calcula uma pontuação de
temperatura de cor (quente/frio/neutro) a partir das respostas sobre
acessórios, batom e comportamento da base, cruza com contraste, intensidade e
estilo desejado, e monta os três blocos do relatório. A foto enviada **nunca**
é processada por esse motor — ela é apenas um anexo visual para a
profissional, exatamente como pedido no briefing. Toda a linguagem usa
"tendência", "provável" e "direção indicada" para evitar prometer um tom exato
de base ou fazer qualquer leitura clínica/de personalidade.

## 3. O que está mockado (e como evolui)

| Área | Hoje (MVP) | Produção |
|---|---|---|
| Banco de dados | `.data/db.json` via `lib/db.ts` | Supabase Postgres — schema pronto em `supabase/schema.sql` (com RLS por `professional_id`) |
| Autenticação | Cookie de sessão + senha com hash (`bcryptjs`) | Supabase Auth (`auth.users`, mantendo `profiles.user_id` como FK) |
| Fotos | Salvas como data URL dentro do próprio registro do diagnóstico | Supabase Storage (bucket privado `diagnostic-photos`, comentado no schema) |
| Pagamento | `POST /api/packages/purchase` simula aprovação instantânea e já credita | Mercado Pago Checkout Pro: `payment_orders` já tem `provider`, `status`, `checkout_url` prontos para um webhook trocar `status` de `pending` para `approved` |

`lib/supabase/client.ts` e `lib/supabase/server.ts` já têm o boilerplate
comentado para quando for plugar o Supabase de verdade.

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

## 6. Limitações conhecidas do MVP

- `.data/db.json` é um arquivo local — funciona bem para demo/dev, mas não
  serve para múltiplas instâncias em produção (é exatamente o que o Supabase
  resolve).
- `npm audit` aponta vulnerabilidades em transitivas do Next.js/jsPDF que só
  são corrigidas com upgrades de major version (Next 16, jsPDF 4). Não foram
  aplicadas aqui para não arriscar breaking changes num MVP recém-entregue —
  vale revisar antes de ir para produção.
- PDF é gerado no navegador (jsPDF) e não fica salvo em storage — o campo
  `pdf_url` existe no schema para quando isso for persistido.
