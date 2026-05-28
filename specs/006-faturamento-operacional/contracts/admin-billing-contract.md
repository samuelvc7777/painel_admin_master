# Contract: Admin Billing

## GET `/admin/billing`

Retorna a leitura operacional da tela de faturamento para administradores e atendentes autenticados.

### Query Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `periodDays` | number | no | `30` | Janela recente para novas assinaturas, cancelamentos e eventos. Valores esperados: `7`, `30`, `90`. |
| `renewalWindowDays` | number | no | `7` | Janela para renovacoes proximas. |
| `planId` | number | no | all plans | Restringe indicadores, eventos e pendencias a um plano. |

### Response

```json
{
  "generatedAt": "2026-05-28T16:20:00.000Z",
  "filters": {
    "periodDays": 30,
    "renewalWindowDays": 7,
    "planId": null
  },
  "availablePlans": [
    {
      "planId": 1,
      "planName": "Premium"
    }
  ],
  "summary": [
    {
      "id": "estimated_mrr",
      "label": "MRR estimado",
      "value": 129900,
      "formattedValue": "R$ 1.299,00",
      "description": "Baseado em assinaturas pagas ativas",
      "periodLabel": "Agora",
      "tone": "positive",
      "href": "/billing?metric=estimated_mrr"
    }
  ],
  "planBreakdown": [
    {
      "planId": 1,
      "planName": "Premium",
      "planCode": "premium",
      "isActive": true,
      "paidSubscriberCount": 15,
      "trialSubscriberCount": 2,
      "estimatedMrrCents": 74925,
      "sharePercent": 57.7,
      "newSubscriptionsCount": 3,
      "cancellationsCount": 1,
      "href": "/plans/1"
    }
  ],
  "events": [
    {
      "id": "subscription_created:123",
      "type": "subscription_created",
      "title": "Nova assinatura",
      "description": "Maria assinou o plano Premium.",
      "impact": "positive",
      "impactAmountCents": 4995,
      "actorName": "Maria",
      "actorEmail": "maria@example.com",
      "relatedUserId": 10,
      "relatedSubscriptionId": 123,
      "relatedPlanName": "Premium",
      "occurredAt": "2026-05-28T15:30:00.000Z",
      "href": "/users/10"
    }
  ],
  "actionQueue": [
    {
      "id": "renewal_due:123",
      "type": "renewal_due",
      "title": "Renovacao critica",
      "description": "Maria tem Premium vencendo em 2 dias.",
      "priority": "high",
      "relatedUserId": 10,
      "relatedPlanName": "Premium",
      "occurredAt": "2026-05-30T15:30:00.000Z",
      "href": "/users/10"
    }
  ],
  "sectionStates": [
    {
      "section": "summary",
      "status": "ready",
      "title": "Resumo de faturamento",
      "message": "Indicadores calculados com assinaturas atuais."
    }
  ]
}
```

### Summary IDs

- `estimated_mrr`
- `estimated_arr`
- `paid_subscribers`
- `trial_subscribers`
- `new_subscriptions`
- `cancellations`
- `renewals_due`

### Event Types

- `subscription_created`
- `subscription_renewed`
- `subscription_canceled`
- `plan_changed`
- `renewal_due`
- `data_issue`

### Action Queue Types

- `renewal_due`
- `recent_cancellation`
- `user_without_plan`
- `billing_data_issue`
- `plan_without_revenue`

### Section Names

- `summary`
- `planBreakdown`
- `events`
- `actionQueue`

### Error Behavior

- `401`: usuario nao autenticado ou sem permissao administrativa.
- `400`: filtro invalido.
- `500`: falha inesperada ao calcular faturamento.
- Erros parciais devem ser preferidos quando apenas uma secao nao puder ser calculada; nesse caso, a resposta permanece `200` e a secao afetada aparece com `status: "error"`.

## Consistency Rules

- Assinaturas canceladas nao podem somar em `estimated_mrr` nem em `paid_subscribers`.
- Nova assinatura ativa deve somar em `estimated_mrr`, `paid_subscribers`, `planBreakdown` e `events`.
- Trial pode somar em `trial_subscribers`, mas nao em `estimated_mrr` se nao houver receita paga confirmada.
- Troca de plano deve gerar leitura de mudanca entre planos, sem duplicar churn quando o cancelamento antigo for apenas substituicao.
- Valores monetarios devem ser retornados em centavos e tambem em formato pronto para exibicao quando fizer parte de um indicador.
