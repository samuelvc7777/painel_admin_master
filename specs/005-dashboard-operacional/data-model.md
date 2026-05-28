# Data Model: Dashboard Operacional

## DashboardOperacional

Agregado retornado para montar a tela inicial administrativa.

**Fields**:

- `generatedAt`: data/hora em que o resumo foi montado.
- `period`: periodo usado para indicadores recentes.
- `summary`: lista de indicadores principais.
- `planDistribution`: distribuicao de assinaturas e receita por plano.
- `operationalQueue`: fila curta de pendencias e oportunidades.
- `recentEvents`: eventos recentes de cadastro, assinatura, renovacao e cancelamento.
- `emptyStates`: mensagens opcionais para secoes sem dados.

**Relationships**:

- Deriva dados de usuarios, assinaturas, planos e notificacoes administrativas.
- Nao deve persistir dados novos neste corte.

## OperationalMetric

Indicador resumido exibido no topo do dashboard.

**Fields**:

- `id`: identificador estavel do indicador.
- `label`: nome exibido.
- `value`: valor bruto numerico ou textual.
- `formattedValue`: valor pronto para exibicao.
- `description`: contexto operacional do indicador.
- `periodLabel`: periodo associado, quando aplicavel.
- `tone`: classificacao visual (`neutral`, `positive`, `warning`, `danger`).
- `href`: link opcional para investigacao.

**Validation Rules**:

- Todo indicador visivel deve ter `label`, `formattedValue` e `description`.
- Valores financeiros estimados devem deixar isso claro na descricao ou rotulo.

## PlanDistributionItem

Linha de distribuicao de usuarios/receita por plano.

**Fields**:

- `planId`: identificador do plano.
- `planName`: nome do plano.
- `planCode`: codigo comercial do plano.
- `isActive`: se o plano esta ativo para novas operacoes.
- `subscriberCount`: quantidade de assinantes ativos no plano.
- `estimatedRevenueCents`: receita estimada do plano em centavos.
- `sharePercent`: participacao aproximada no total de receita estimada.
- `href`: link para detalhes/gestao do plano.

**Validation Rules**:

- Planos sem assinantes podem aparecer apenas quando ajudarem a explicar ausencia de receita ou configuracao.
- Planos inativos devem ser visualmente diferenciados se aparecerem.

## OperationalQueueItem

Item acionavel que pede atencao do administrador.

**Fields**:

- `id`: identificador estavel.
- `type`: tipo da pendencia (`user_without_plan`, `renewal_due`, `recent_cancellation`, `unread_notification`, `inactive_user`, `other`).
- `title`: chamada curta da acao.
- `description`: contexto suficiente para decisao.
- `priority`: prioridade (`high`, `medium`, `low`).
- `relatedUserId`: usuario relacionado, quando houver.
- `relatedPlanName`: plano relacionado, quando houver.
- `occurredAt`: data/hora relevante.
- `href`: destino do clique.

**Validation Rules**:

- Itens de alta prioridade devem aparecer antes dos demais.
- Todo item deve ter acao ou destino claro.

## RecentOperationalEvent

Evento recente para leitura rapida do que mudou no negocio.

**Fields**:

- `id`: identificador estavel.
- `type`: tipo (`user_created`, `subscription_created`, `subscription_renewed`, `subscription_canceled`).
- `title`: titulo curto.
- `description`: detalhe com usuario/plano quando disponivel.
- `actorName`: pessoa relacionada.
- `actorEmail`: email relacionado, quando seguro exibir.
- `relatedUserId`: usuario relacionado, quando houver.
- `relatedSubscriptionId`: assinatura relacionada, quando houver.
- `relatedPlanName`: plano relacionado, quando houver.
- `occurredAt`: data/hora do acontecimento.
- `href`: link para detalhes.

**Validation Rules**:

- Eventos devem ser ordenados do mais recente para o mais antigo.
- Se dados atuais do usuario mudarem, o evento ainda deve ficar compreensivel com as informacoes disponiveis.

## DashboardSectionState

Estado de apresentacao para secoes sem dados ou com falha parcial.

**Fields**:

- `section`: identificador da secao.
- `status`: `ready`, `empty` ou `error`.
- `title`: titulo do estado.
- `message`: explicacao clara.
- `actionLabel`: texto de acao opcional.
- `actionHref`: destino opcional.

**Validation Rules**:

- Nenhuma secao deve renderizar visualmente vazia sem estado.
- Mensagens de erro devem ser administrativas e nao tecnicas demais.
