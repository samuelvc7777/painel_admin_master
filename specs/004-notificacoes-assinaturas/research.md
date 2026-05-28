# Research: Notificacoes de Assinaturas e Cadastros

## Decision: Derivar notificacoes das tabelas existentes no Supabase

**Rationale**: A base real ja possui `User`, `Subscription`, `Plan` e `GooglePlaySubscriptionEvent`. Para o primeiro corte do painel admin, e mais simples e menos arriscado montar a lista de notificacoes a partir desses registros ja existentes e evitar uma nova tabela apenas para feed visual.

**Alternatives considered**:

- Tabela nova `AdminNotification`: resolve visto/nao visto multi-dispositivo, mas adiciona migration e superficie de manutencao.
- Estado persistido no backend por administrador: mais robusto, mas maior que o necessario para validar a experiencia inicial.

## Decision: Usar `User` e `Subscription` como fonte principal do feed

**Rationale**: O painel ja hidrata usuarios e assinaturas. `User.createdAt`, `Subscription.createdAt`, `Subscription.canceledAt` e atualizacoes de assinatura permitem montar notificacoes sem escrever registros adicionais.

**Alternatives considered**:

- Persistir uma notificacao no sucesso de cada acao: mais exato, mas exige tabela nova.
- Usar apenas `GooglePlaySubscriptionEvent`: cobre eventos Play Store, mas nao cobre usuario novo nem todas as alteracoes feitas pelo painel.

## Decision: Tratar visto/nao visto no navegador

**Rationale**: Sem tabela nova, o estado lido por administrador fica local ao navegador. Isso atende a experiencia inicial do sino sem alterar o banco.

**Alternatives considered**:

- Persistir `readAt` por notificacao no banco: exigiria nova entidade.
- Nao ter estado visto/nao visto: simplifica ainda mais, mas perde parte importante da UX.

## Decision: Expor endpoints administrativos de notificacoes

**Rationale**: O header do dashboard ja consome dados por `fetchApi` e o catch-all `/api` ja centraliza autorizacao administrativa. Um endpoint de listagem mantem a regra de montagem do feed no servidor.

**Alternatives considered**:

- Consulta direta do browser ao Supabase: enfraquece controle de permissao e duplica regras no cliente.
- Misturar notificacoes no endpoint de dashboard: acopla uma area operacional frequente a uma tela especifica.

## Decision: Usar dropdown/popover no sino existente e componentes dedicados

**Rationale**: O layout ja possui um botao de sino no header. Transformar esse ponto em entrada funcional preserva a UX atual e evita criar uma pagina inteira antes de existir volume real de notificacoes.

**Alternatives considered**:

- Criar pagina dedicada de notificacoes no primeiro corte: mais escopo visual e de navegacao.
- Mostrar apenas toast temporario: nao atende revisao de notificacoes recentes.
