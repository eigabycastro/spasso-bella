# Auditoria de privacidade, legal e acessibilidade — Spasso Bella MG

Data: 18/11/2026 · Escopo: site público (`/`, `/privacidade`, `/termos`) e Spasso Bella Manager (área logada).

> Este documento é uma revisão técnica, não um parecer jurídico. Antes de publicar, peça a um(a)
> advogado(a) para revisar a Política de Privacidade e os Termos de Uso.

## 1. Leis brasileiras aplicáveis

| Lei | O que exige deste projeto | Como foi atendido |
| --- | --- | --- |
| **LGPD** — Lei nº 13.709/2018 | Base legal para cada dado, transparência, direitos do titular (art. 18), segurança, dado sensível só com base específica (art. 11), dados de menores com autorização do responsável (art. 14) | Política de Privacidade, coleta mínima, exportar/excluir dados da cliente, aviso sobre dado de saúde, RLS no banco |
| **Resolução CD/ANPD nº 2/2022** (agentes de pequeno porte) | Dispensa de encarregado (DPO), mas exige canal de comunicação com o titular | E-mail de privacidade + WhatsApp na política (campo em Configurações) |
| **Marco Civil da Internet** — Lei nº 12.965/2014, art. 15 | Guarda de registros de acesso por 6 meses | Feito pela hospedagem (Vercel); informado na política |
| **Código de Defesa do Consumidor** — Lei nº 8.078/1990 | Informação clara e preço (art. 6º, III; art. 31), oferta vincula (art. 30), publicidade não enganosa (art. 37), foro do consumidor (art. 101) | Preços e duração no site, textos sem promessas, termos de uso |
| **Decreto nº 7.962/2013** (comércio eletrônico) | Nome empresarial, CNPJ/CPF, endereço e contato visíveis no site | Campos em Configurações; rodapé e políticas mostram o que estiver preenchido |
| **Lei Brasileira de Inclusão** — Lei nº 13.146/2015, art. 63 | Acessibilidade em sites de empresas com sede no país | Auditoria WCAG 2.1 AA (seção 4) |
| **Código Civil**, art. 20 | Uso de imagem depende de autorização | Upload da galeria exige confirmar a autorização da cliente |
| **Leis nº 9.610/1998 e 9.279/1996** | Direitos autorais e marca | Cláusula nos termos |

## 2. Dados pessoais tratados (coleta mínima)

| Dado | Obrigatório? | Finalidade | Base legal |
| --- | --- | --- | --- |
| Nome, WhatsApp | Sim | Agendar, confirmar, lembrar | Execução de contrato (art. 7º, V) |
| Atendimentos e pagamentos | Sim | Controle financeiro e fiscal | Obrigação legal (art. 7º, II) |
| Aniversário | Não | Mensagem de parabéns | Consentimento (art. 7º, I) |
| Observações (ex.: alergia) | Não | Segurança no procedimento | Consentimento específico — dado sensível (art. 11, I) |
| Fotos da galeria | Não | Divulgação do trabalho | Consentimento + direito de imagem |

O site público **não tem formulário** e não coleta nada digitado pela visitante.

**Direitos do titular no painel** (Clientes → ficha da cliente → "Privacidade da cliente"):
- **Exportar dados** (art. 18, II e V): arquivo JSON com cadastro, atendimentos e pagamentos.
- **Excluir dados pessoais** (art. 18, VI): apaga nome, telefone, aniversário, observações da cliente e
  observações dos atendimentos dela; atendimentos e pagamentos ficam anônimos (obrigação fiscal, art. 16, I).

## 3. Rastreamento e terceiros

| Item | Encontrado | Situação |
| --- | --- | --- |
| Google Analytics / Tag Manager / Pixel / Hotjar / Clarity | Nenhum | Não há rastreamento. Se um dia for adicionado, precisa de consentimento prévio e de atualização da política. |
| **Google Fonts** | Carregado em toda visita, enviando o IP ao Google sem consentimento | **Corrigido:** fontes hospedadas no próprio site (`@fontsource`) |
| Google Maps | Iframe carregado só após toque | Agora também respeita a escolha de privacidade e pergunta antes de carregar |
| Supabase (banco, login, fotos) | Operador | Informado na política; transferência internacional (art. 33) |
| Vercel (hospedagem) | Operador | Informado na política; registros de acesso (Marco Civil) |
| WhatsApp / Instagram | Só links | Nada é carregado no site |

**Cookies e armazenamento:** só essenciais: `spasso-consent-v1` (escolha de privacidade) e a sessão do
Supabase (apenas quando a administradora faz login). Aviso de privacidade com "Usar só o essencial" e
"Permitir o mapa" com o mesmo peso visual, reabrível pelo rodapé.

## 4. Acessibilidade (WCAG 2.1 AA)

| Critério | Problema encontrado | Correção |
| --- | --- | --- |
| 1.4.3 Contraste (texto) | Textos em vinho 40–65% e bordô 45–80% de opacidade abaixo de 4,5:1 | Texto só em vinho ≥ 70% (5,06:1 no pior caso) ou bordô 100% (6,67:1) |
| 1.4.11 Contraste (componentes) | Borda dos campos em rosé (2,2:1) | Borda em bordô 70% (≥ 3,4:1); erro com borda de 2 px |
| 1.4.1 Uso da cor | Itens inativos/cancelados só esmaecidos | Sem esmaecer o texto; identificados por etiqueta e texto riscado |
| 2.4.1 Pular blocos | Não havia | Link "Pular para o conteúdo" no site e no painel |
| 2.4.7 Foco visível | `focus:outline-none` nos campos | Contorno de foco global mantido em todos os campos |
| 2.1.2 / 2.4.3 Teclado em janelas | Foco podia sair do modal | Foco entra na janela, Tab circula dentro, Esc fecha, foco volta a quem abriu |
| 4.1.2 Nome/estado | Menu "Mais" sem estado | `aria-expanded`/`aria-controls`, Esc fecha |
| 3.3.1 / 3.3.2 Erros e instruções | Erro não ligado ao campo | `aria-describedby` + `role="alert"` em erros; dicas ligadas ao campo |
| 2.4.4 Propósito do link | Botões curtos ("Receber", "Abrir", "WhatsApp"), links externos sem aviso | Textos completos ("Receber pagamento", "Ver estoque"…) e "(abre em nova aba)" para leitor de tela |
| 2.3.3 Movimento | — | Animações só com `motion-safe`; "reduzir movimento" desliga tudo |
| 2.5.5 Área de toque | — | Mínimo de 44 px mantido |

Contraste medido com a fórmula da WCAG (luminância relativa) para todas as combinações usadas.

## 5. Textos sem comprovação (CDC art. 37)

| Antes | Depois |
| --- | --- |
| "Feitos com calma e capricho" | "Procedimentos e valores" |
| "Sem fila e sem pressa" | "Uma profissional, uma cliente por vez: o horário fica reservado para você" |

Termos de uso: os resultados variam de pessoa para pessoa, e as fotos não garantem resultado idêntico.

## 6. Pendências (dependem da dona do studio)

1. Preencher em **Configurações → Dados legais**: nome empresarial, CNPJ (ou CPF) e e-mail de privacidade.
   Antes, aplicar `supabase/migrations/20261118000005_dados_legais.sql`.
2. Confirmar o prazo de guarda após o último atendimento (a política diz "em geral, até 5 anos").
3. Revisão jurídica da Política de Privacidade e dos Termos de Uso.
4. Conferir nos painéis da Supabase e da Vercel a região dos servidores e os termos de processamento de dados (DPA).
5. Teste com leitor de tela real (TalkBack no Android / VoiceOver no iPhone).
