# Contract: Admin Notifications

Todos os endpoints exigem usuario autenticado com permissao administrativa pelo mesmo mecanismo usado nos endpoints atuais do painel.

## GET /api/admin/notifications

Lista notificacoes administrativas recentes.

### Query Parameters

- `limit` opcional: quantidade maxima de itens. Padrao recomendado: 20.

### Response 200

```json
{
  "items": [
    {
      "id": "42",
      "type": "SUBSCRIPTION_RENEWED",
      "title": "Assinatura renovada",
      "message": "Maria Silva renovou o plano Premium.",
      "relatedUserId": 10,
      "relatedSubscriptionId": 88,
      "relatedPlanName": "Premium",
      "actorName": "Maria Silva",
      "actorEmail": "maria@email.com",
      "occurredAt": "2026-05-28T14:30:00.000Z",
      "readAt": null,
      "createdAt": "2026-05-28T14:30:01.000Z"
    }
  ]
}
```

### Errors

- `401`: sessao ausente, invalida ou sem permissao administrativa.
- `400`: parametro invalido.

O estado de vista/nao vista e controlado no navegador do administrador por `eventKey`; este contrato nao grava leitura no backend.
