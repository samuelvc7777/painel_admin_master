# Data Model: Faturamento Operacional

## Usuario/Cliente

**Purpose**: Representa a conta administrada que pode assinar, trocar, renovar ou cancelar planos.

**Fields**:

- `id`: identificador do usuario.
- `name`: nome exibido nos detalhes, eventos e filas.
- `email`: contato usado para auditoria e navegacao.
- `isActive`: indica se o usuario ainda participa da base operacional.
- `createdAt`: data usada para contexto de cadastro.
- `activeSubscription`: assinatura comercial atual quando existir.
- `subscriptions`: historico de assinaturas do usuario.

**Relationships**:

- Possui zero ou mais `Assinatura`.
- Pode aparecer em `Evento de Faturamento` e `Pendencia Operacional`.

## Plano

**Purpose**: Representa a oferta comercial vendida.

**Fields**:

- `id`: identificador do plano.
- `code`: codigo estavel para agrupamento.
- `name`: nome exibido ao administrador.
- `priceCents`: valor base do plano em centavos.
- `durationDays`: duracao usada para normalizar MRR.
- `isActive`: indica se o plano ainda esta disponivel.
- `color`: cor visual ja usada no painel.

**Relationships**:

- Pode estar associado a muitas `Assinatura`.
- Agrega receita e assinantes em `PlanoFaturamento`.

**Validation Rules**:

- Planos sem preco valido nao devem contribuir para MRR.
- Planos inativos ainda podem aparecer se possuirem assinaturas historicas ou eventos recentes.

## Assinatura

**Purpose**: Representa o vinculo comercial entre usuario e plano.

**Fields**:

- `id`: identificador da assinatura.
- `status`: estado comercial atual.
- `startDate`: inicio da vigencia.
- `endDate`: fim previsto da vigencia.
- `canceledAt`: data de cancelamento, quando houver.
- `autoRenew`: indica renovacao automatica.
- `plan`: plano relacionado.
- `createdAt`: data de criacao do vinculo.
- `updatedAt`: data da ultima alteracao.

**State Transitions**:

- `TRIAL` -> `ACTIVE`: passa a representar assinatura comercialmente ativa.
- `ACTIVE` -> `CANCELED`: sai de assinantes pagos e MRR atual.
- `ACTIVE` -> `ACTIVE` com nova vigencia: renovacao.
- `ACTIVE` -> `CANCELED` + nova assinatura do mesmo usuario em janela curta: troca de plano.

**Validation Rules**:

- Somente `ACTIVE` com plano pago valido entra no MRR atual.
- `TRIAL` pode entrar na base comercial ativa, mas nao no MRR pago.
- Assinaturas vencidas nao devem contar como ativas se a data de fim ja passou.
- `CANCELED` ou `canceledAt` preenchido sempre remove a assinatura dos totais atuais.

## IndicadorFaturamento

**Purpose**: Numero calculado para decisao operacional.

**Fields**:

- `id`: chave do indicador.
- `label`: nome curto exibido.
- `value`: valor bruto numerico.
- `formattedValue`: valor formatado para exibicao.
- `description`: explicacao do calculo.
- `periodLabel`: periodo ou contexto do indicador.
- `tone`: classificacao visual entre neutro, positivo, alerta ou risco.
- `href`: destino para drill-down quando existir.

**Examples**:

- MRR estimado.
- Receita anualizada estimada.
- Assinantes pagos ativos.
- Trials.
- Novas assinaturas no periodo.
- Cancelamentos no periodo.
- Renovacoes proximas.

## PlanoFaturamento

**Purpose**: Agrega impacto de faturamento por plano.

**Fields**:

- `planId`: identificador do plano.
- `planName`: nome do plano.
- `planCode`: codigo do plano.
- `isActive`: estado atual do plano.
- `paidSubscriberCount`: assinantes pagos ativos.
- `trialSubscriberCount`: usuarios em trial.
- `estimatedMrrCents`: MRR estimado do plano.
- `sharePercent`: participacao no MRR total.
- `newSubscriptionsCount`: novas assinaturas do periodo.
- `cancellationsCount`: cancelamentos reais do periodo.
- `href`: destino de detalhe do plano.

**Validation Rules**:

- `sharePercent` so deve ser exibido quando houver MRR total maior que zero.
- Cancelamentos tecnicos de troca de plano nao devem inflar `cancellationsCount`.

## EventoFaturamento

**Purpose**: Explica mudancas recentes e permite auditoria.

**Fields**:

- `id`: identificador do evento.
- `type`: tipo do evento.
- `title`: titulo curto.
- `description`: descricao operacional.
- `impact`: positivo, negativo, neutro ou alerta.
- `impactAmountCents`: impacto estimado em receita quando aplicavel.
- `actorName`: usuario relacionado.
- `actorEmail`: email relacionado.
- `relatedUserId`: usuario associado.
- `relatedPlanName`: plano associado.
- `occurredAt`: data do evento.
- `href`: destino para investigar o evento.

**Types**:

- `subscription_created`
- `subscription_renewed`
- `subscription_canceled`
- `plan_changed`
- `renewal_due`
- `data_issue`

## PendenciaFaturamento

**Purpose**: Item acionavel para o administrador priorizar.

**Fields**:

- `id`: identificador da pendencia.
- `type`: tipo da pendencia.
- `title`: titulo operacional.
- `description`: explicacao do risco ou oportunidade.
- `priority`: alta, media ou baixa.
- `relatedUserId`: usuario associado, quando houver.
- `relatedPlanName`: plano associado, quando houver.
- `occurredAt`: data de referencia.
- `href`: destino para acao.

**Types**:

- `renewal_due`
- `recent_cancellation`
- `user_without_plan`
- `billing_data_issue`
- `plan_without_revenue`

## EstadoSecaoFaturamento

**Purpose**: Controla estados prontos, vazios e de erro parcial.

**Fields**:

- `section`: nome da secao.
- `status`: `ready`, `empty` ou `error`.
- `title`: titulo do estado.
- `message`: explicacao clara.
- `actionLabel`: texto da acao quando existir.
- `actionHref`: destino da acao quando existir.

**Validation Rules**:

- Secoes vazias devem explicar motivo e proxima acao.
- Secoes com erro parcial nao devem invalidar automaticamente as demais secoes.
