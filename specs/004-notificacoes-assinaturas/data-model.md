# Data Model: Notificacoes de Assinaturas e Cadastros

## AdminNotification

Representa uma notificacao administrativa derivada dos registros existentes para exibicao no painel.

### Fields

- `id`: identificador unico derivado da chave do evento.
- `type`: tipo do evento. Valores esperados: `SUBSCRIPTION_CREATED`, `SUBSCRIPTION_RENEWED`, `SUBSCRIPTION_CANCELED`, `USER_CREATED`.
- `title`: titulo curto exibido na lista.
- `message`: mensagem administrativa curta.
- `eventKey`: chave unica do evento confirmado para deduplicacao.
- `relatedUserId`: usuario relacionado, quando houver.
- `relatedSubscriptionId`: assinatura relacionada, quando houver.
- `relatedPlanName`: nome do plano no momento do evento, quando houver.
- `actorName`: nome do cliente/usuario relacionado no momento do evento.
- `actorEmail`: email do cliente/usuario relacionado no momento do evento.
- `occurredAt`: data e hora em que o evento aconteceu.
- `readAt`: data e hora local em que a notificacao foi marcada como vista no navegador; nulo enquanto nao vista.
- `createdAt`: data e hora derivada do evento original.

### Validation Rules

- `type`, `title`, `message`, `eventKey`, `occurredAt` e `createdAt` sao obrigatorios.
- `eventKey` deve ser estavel para impedir notificacoes duplicadas do mesmo evento derivado.
- `readAt` e controlado localmente pelo painel e nao altera o Supabase.
- `message` deve ser curta e suficiente para identificar o evento sem abrir outra tela.

### Relationships

- Pode referenciar um usuario por `relatedUserId`.
- Pode referenciar uma assinatura por `relatedSubscriptionId`.
- Deve preservar `actorName`, `actorEmail` e `relatedPlanName` como snapshot para continuar legivel se os dados atuais mudarem depois.

### State Transitions

```text
unread -> read
```

- Uma notificacao nasce nao vista naquele navegador.
- Ao ser aberta ou marcada manualmente, recebe estado de leitura local.
- Nao ha exclusao ou arquivamento no escopo inicial.

## Subscription Event

Representa o evento confirmado que origina notificacoes de assinatura.

### Fields

- `eventType`: nova assinatura, renovacao ou cancelamento.
- `userId`: cliente afetado.
- `subscriptionId`: assinatura afetada.
- `planName`: plano envolvido no evento.
- `occurredAt`: horario confirmado da mudanca.

### Validation Rules

- So deve gerar notificacao depois da operacao de assinatura ser concluida com sucesso.
- Eventos repetidos devem reutilizar a mesma `eventKey`.

## User Signup Event

Representa um usuario novo identificado pelo painel.

### Fields

- `userId`: usuario cadastrado.
- `name`: nome do usuario.
- `email`: email do usuario.
- `createdAt`: horario de cadastro.

### Validation Rules

- So deve gerar notificacao para usuario persistido.
- A notificacao deve evitar expor dados sensiveis alem de nome/email ja usados no painel.
