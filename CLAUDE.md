# Spasso Bella MG

Sistema de gestão + site público de um studio de beleza com **uma única profissional**
(a dona). Ela usa no celular e no computador. Prioridade absoluta: **simples e rápido**
— cadastrar cliente, marcar horário e registrar pagamento em poucos toques.

Idioma: interface, textos, nomes de rotas e mensagens em **português do Brasil**.
Código (variáveis, funções, tipos) em inglês, exceto nomes de páginas/rotas já existentes.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tokens em `src/styles/globals.css`, sem `tailwind.config`)
- React Router (`src/routes/AppRoutes.tsx`, menu em `src/routes/navigation.ts`)
- Supabase: Postgres, Auth, Storage (`@supabase/supabase-js`)
- React Hook Form + Zod (todo formulário)
- date-fns + date-fns-tz (fuso **America/Sao_Paulo**), Recharts, Lucide React
- Hospedagem: Vercel

## Identidade visual

Use SEMPRE os tokens, nunca hex soltos no JSX:

| Token | Hex | Uso |
| --- | --- | --- |
| `vinho` | #5B1725 | Botão principal, títulos, item ativo do menu |
| `bordo` | #843D4A | Hover, ícones, textos de apoio |
| `rose` | #D9A0A7 | Bordas, badges, destaques, gráficos |
| `rosa-claro` | #F7EDEF | Fundo da página |
| `branco` | #FFFFFF | Cards, formulários, modais |

- Fontes: `font-script` (Great Vibes) SÓ para o nome "Spasso Bella"; `font-sans` (Inter) no resto.
- Cards: `rounded-2xl border border-rose/30 bg-branco` (componente `Card`).
- Um único botão `bg-vinho` por tela (ação principal); os outros em contorno.
- Ícones Lucide com `strokeWidth={1.75}`.
- Mobile-first: testar em 360 px. No celular a navegação é a `BottomNav`; no PC, a `Sidebar`.
- Toque mínimo de 44 px em botões no celular.

## Estrutura

```
src/
  components/ui/       componentes genéricos (Card, Button, Input, Modal...)
  components/layout/   Sidebar, Header, BottomNav, AppLayout
  components/shared/   Brand, StatCard, ExampleBadge, PagePlaceholder
  pages/<modulo>/      uma pasta por módulo (agenda, clientes, financeiro...)
  services/            ÚNICO lugar que chama o Supabase (um arquivo por módulo)
  hooks/               hooks de dados e de auth
  types/database.ts    tipos gerados pelo Supabase
  utils/               formatCurrency, formatDate, whatsappLink...
supabase/migrations/   SQL versionado (nunca editar uma migration já aplicada; criar outra)
```

## Regras obrigatórias

1. **Telas nunca chamam o Supabase direto.** Sempre via `src/services/*.ts`.
2. **Segurança:** só a chave pública (`VITE_SUPABASE_ANON_KEY`) no frontend. Nunca usar,
   pedir ou escrever a `service_role`/secret key no código. RLS ligado em todas as tabelas;
   acesso da administradora via `public.is_admin()`.
3. **Datas:** gravar `timestamptz`; exibir e montar horários em America/Sao_Paulo com date-fns-tz.
   Datas sem hora (`transactions.date`, `birthday`) são `date`.
4. **Dinheiro:** `numeric(10,2)` no banco; exibir com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
5. **Preço histórico:** ao agendar, copiar `name`, `price` e `duration_min` do serviço para `appointment_items`.
6. **Agenda sem conflito:** o banco recusa horários sobrepostos (`appointments_no_overlap`).
   Criar/editar atendimento SÓ via `supabase.rpc('save_appointment', ...)`, que salva os itens
   na mesma transação e devolve o erro `HORARIO_OCUPADO` — mostrar "Esse horário já está ocupado".
7. **Pagamentos:** dinheiro, Pix, débito, crédito; um atendimento pode ter vários pagamentos (parcial).
8. **Estoque:** nunca alterar `products.quantity` direto. Registrar em `stock_movements`
   (o gatilho atualiza a quantidade). Correção = movimento do tipo `ajuste`.
9. **Sem dados falsos como se fossem reais.** Qualquer número de demonstração leva `ExampleBadge`.
10. Erros e mensagens para a usuária em português simples ("Esse horário já está ocupado").
11. Toda tela tem estado de carregando, vazio ("Nenhuma cliente ainda") e erro.

## Banco (resumo)

`admins`, `clients`, `services`, `appointments`, `appointment_items`, `transactions`,
`products`, `stock_movements`, `business_settings` (linha única id=1), `gallery_images`,
view `appointment_summary` (total e pago por atendimento).
Detalhes em `supabase/migrations/`.

## Comandos

- `npm run dev` — desenvolvimento (http://localhost:5173)
- `npm run build` — checa tipos e gera build; **rodar antes de dar uma tarefa como pronta**

## Como trabalhar

- Construímos por sprints; não adiantar funcionalidades de sprints futuros.
- Mudanças pequenas e testáveis. Ao terminar, listar o que mudou e como testar.
- Na dúvida sobre regra de negócio do studio, perguntar em vez de inventar.

## Estado atual

Todos os módulos usam o banco (o modo demonstração e `data/examples.ts` foram removidos no Sprint 07).
Se algum dia houver dado de demonstração de novo, ele precisa do `ExampleBadge` (regra 9).

- Dados: `services/*.ts` (clients, catalog, appointments, finance, inventory, settings, gallery, reports).
- Listas: `useListResource` / `useResource` / `useAppointments` / `useSettings` +
  `LoadingState` / `ErrorState` / `EmptyState`.
- Site público (`pages/site`) lê como visitante: serviços ativos e públicos, `business_settings` e
  `gallery_images` públicas. Galeria gerenciada em Configurações (upload exige confirmar autorização LGPD;
  a foto é reduzida no aparelho para no máx. 1600 px antes do envio).
- Deploy: Vercel, com `vercel.json` (rotas do SPA) e as variáveis `VITE_SUPABASE_*` no painel da Vercel.

Horário do studio: `business_settings.opening_hours` (jsonb) = `{ week: DayHours[7], lunch, interval_min }`.
Vazio ({}) = padrão em `services/settings.ts` (seg–sáb 09–18, almoço 12–13). Fora do horário, almoço e
folga só geram **aviso** no formulário; quem **bloqueia** sobreposição é o banco.

Categorias do financeiro: não há tabela; vêm dos próprios lançamentos (`listCategories`).
Prontas: entrada "Atendimento", despesa "Produtos" (informado). As demais a dona cria ao lançar.
Pagamento de atendimento: `appointment_id` + `client_id`, categoria "Atendimento", não pode passar do que falta.

Estoque: alerta de reposição = produto ativo com mínimo > 0 e quantidade <= mínimo (`isLowStock`).
No ajuste a tela pede a quantidade contada e grava a diferença. Produto não se apaga: desativa.

## Privacidade, legal e acessibilidade (ver `docs/auditoria-lgpd-acessibilidade.md`)

- **Sem rastreamento.** Nada de Analytics, Pixel ou similares sem consentimento prévio + atualizar `/privacidade`.
- **Sem recurso de terceiros carregado automaticamente.** Fontes são locais (`@fontsource`). Conteúdo de terceiro
  (ex.: Google Maps) só carrega com `useConsent().maps` ou após a pessoa permitir.
- **Coleta mínima:** campo novo de dado pessoal só com finalidade clara; dado de saúde só com consentimento.
  Mudou o que é coletado? Atualizar a Política de Privacidade e a data dela.
- **Textos do site sem promessas que não dá para comprovar** (CDC art. 37).
- **Contraste:** texto em `text-vinho` ≥ /70 ou `text-bordo` (100%). Nunca abaixo disso.
  Borda de campo: `border-bordo/70`. Não usar `focus:outline-none` em controles.
- **Teclado:** usar `Modal` (já prende e devolve o foco). Botão só com ícone precisa de `aria-label`.
  Link que abre outra aba leva `<span className="sr-only"> (abre em nova aba)</span>`.
- Botões dizem a ação completa ("Receber pagamento", não "Receber").

## WhatsApp (envio manual assistido — sem API)

- Mensagens abrem pelo link `wa.me` com o texto pronto; quem envia é a profissional (sem custo, sem risco de banimento).
  API oficial da Meta (envio automático) fica para depois: exige CNPJ/Business verificado, número dedicado e custo por mensagem.
  Nunca usar APIs não oficiais (Z-API, Evolution etc.): violam os termos e podem banir o número.
- Textos em `business_settings.message_templates` (Configurações), com campos `{nome}`, `{data}`, `{hora}`, `{servicos}`.
  Padrão e preenchimento em `utils/whatsappMessages.ts` (`{data}` vira "hoje", "amanhã" ou "na sexta, 21/11").
- Envio marcado em `appointments.confirmation_sent_at` / `reminder_sent_at` via `WhatsAppSendLink` + `markMessageSent`.
- "Lembretes de amanhã" no Dashboard (`pages/dashboard/RemindersCard.tsx`).

## Animações do site público

- Biblioteca `motion` (`motion/react`), **só no site**: `SiteLayout` é carregado sob demanda, então o painel não baixa a biblioteca.
- `SiteLayout` envolve tudo em `<MotionConfig reducedMotion="user">`. Animações contínuas em CSS usam `motion-safe:animate-*`
  (definidas em `globals.css`, com `prefers-reduced-motion` desligando todas). Animar só `transform`/`opacity`.
- Entrada de seções: `Reveal` (subir + desfoque). Listas: `variants` com `staggerChildren` (ver `HomePage`).
- Abertura em `pages/site/Hero.tsx`, letreiro em `ServicesMarquee.tsx`. Camadas de fundo com profundidade precisam ser
  mais altas que a tela (`h-[170vh]`), senão a borda aparece ao rolar.
- Testar animação com rolagem real (Puppeteer em tempo real); prints com `--virtual-time-budget` não disparam "ao entrar na tela".
