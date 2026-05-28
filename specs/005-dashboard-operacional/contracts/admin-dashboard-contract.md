# Contract: Admin Dashboard

## GET /admin/dashboard

Retorna o agregado operacional da tela inicial administrativa.

### Authentication

- Requer token de administrador ou atendente autenticado.
- Usuarios sem permissao administrativa recebem erro de acesso.

### Query Parameters

Nenhum parametro obrigatorio neste corte.

### Success Response

```json
{
  "generatedAt": "2026-05-28T12:00:00.000Z",
  "period": {
    "recentDays": 7,
    "renewalWindowDays": 7
  },
  "summary": [
    {
      "id": "estimated_mrr",
      "label": "Receita mensal estimada",
      "value": 29900,
      "formattedValue": "R$ 299,00",
      "description": "Baseada em assinaturas ativas",
      "periodLabel": "MRR atual",
      "tone": "positive",
      "href": "/billing"
    }
  ],
  "planDistribution": [
    {
      "planId": 1,
      "planName": "Mensal",
      "planCode": "mensal",
      "isActive": true,
      "subscriberCount": 10,
      "estimatedRevenueCents": 29900,
      "sharePercent": 100,
      "href": "/plans/1"
    }
  ],
  "operationalQueue": [
    {
      "id": "renewal_due:123",
      "type": "renewal_due",
      "title": "Assinatura vence em breve",
      "description": "Cliente com renovacao prevista nos proximos 7 dias.",
      "priority": "medium",
      "relatedUserId": 123,
      "relatedPlanName": "Mensal",
      "occurredAt": "2026-05-28T12:00:00.000Z",
      "href": "/users/123"
    }
  ],
  "recentEvents": [
    {
      "id": "user-created:123",
      "type": "user_created",
      "title": "Novo usuario cadastrado",
      "description": "Cliente entrou na base sem plano ativo.",
      "actorName": "Cliente Exemplo",
      "actorEmail": "cliente@example.com",
      "relatedUserId": 123,
      "relatedSubscriptionId": null,
      "relatedPlanName": null,
      "occurredAt": "2026-05-28T12:00:00.000Z",
      "href": "/users/123"
    }
  ],
  "sectionStates": [
    {
      "section": "planDistribution",
      "status": "ready",
      "title": "Receita por plano",
      "message": "Distribuicao calculada com assinaturas ativas.",
      "actionLabel": "Gerenciar planos",
      "actionHref": "/plans"
    }
  ]
}
```

### Error Response

```json
{
  "message": "Acesso negado: Este portal e restrito a administradores e atendentes."
}
```

### Contract Rules

- `summary` deve conter pelo menos usuarios totais, usuarios ativos, assinantes ativos, novos usuarios recentes e receita mensal estimada.
- Dinheiro deve trafegar em centavos quando for valor bruto e tambem ter `formattedValue` para a UI.
- `operationalQueue` deve vir ordenada por prioridade e data.
- `recentEvents` deve vir do mais recente para o mais antigo.
- Secoes vazias devem retornar estado explicativo em `sectionStates`, nao listas silenciosamente sem contexto quando isso prejudicar a leitura.
- O endpoint nao deve exigir que a UI busque `/user` para calcular os principais blocos do dashboard.
