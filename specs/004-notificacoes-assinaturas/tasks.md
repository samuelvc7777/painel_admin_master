# Tasks: Notificacoes de Assinaturas e Cadastros

**Input**: Design documents from `/specs/004-notificacoes-assinaturas/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-notifications-contract.md, quickstart.md

**Tests**: A especificacao nao pediu TDD. As tarefas incluem validacao manual via quickstart e validacao tecnica com `npm run lint` e `npm run build`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo quando usa arquivos diferentes e nao depende de tarefa incompleta
- **[Story]**: Mapeia a tarefa para uma user story especifica
- Todas as tarefas incluem caminho exato de arquivo

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar arquivos compartilhados da feature antes de mexer nas historias.

- [X] T001 Criar o diretorio de componentes de notificacoes em src/components/notifications/
- [X] T002 [P] Criar os tipos compartilhados de notificacao administrativa em src/lib/notifications.ts
- [X] T003 [P] Validar no Supabase real que User, Subscription, Plan e GooglePlaySubscriptionEvent ja existem como fonte de notificacoes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implementar a base derivada e os contratos de API usados por todas as historias.

**CRITICAL**: Nenhuma user story deve iniciar antes desta base estar pronta.

- [X] T004 Montar notificacoes administrativas derivadas de User e Subscription em src/lib/api/server.ts
- [X] T005 Implementar helper de montagem de eventKey e payload de notificacao em src/lib/api/server.ts
- [X] T006 Implementar deduplicacao visual por eventKey em src/lib/api/server.ts
- [X] T007 Implementar listAdminNotifications com limit em src/lib/api/server.ts
- [X] T008 Implementar estado visto/nao visto local por eventKey em src/components/notifications/admin-notifications-popover.tsx
- [X] T009 Expor GET /admin/notifications em src/app/api/[[...path]]/route.ts

**Checkpoint**: Foundation ready - endpoints administrativos de notificacoes podem ser consumidos por qualquer historia.

---

## Phase 3: User Story 1 - Receber notificacao de eventos de assinatura (Priority: P1) MVP

**Goal**: Administradores recebem notificacoes internas quando assinatura e criada, renovada ou cancelada.

**Independent Test**: Gerar nova assinatura, renovacao e cancelamento para um cliente e verificar no endpoint/lista que cada evento criou uma notificacao identificavel, sem duplicidade para o mesmo evento.

### Implementation for User Story 1

- [X] T010 [US1] Registrar notificacao de nova assinatura apos sucesso de changePlan em src/lib/api/server.ts
- [X] T011 [US1] Registrar notificacao de renovacao apos sucesso de renewSubscription em src/lib/api/server.ts
- [X] T012 [US1] Registrar notificacao de cancelamento apos sucesso de cancelSubscription em src/lib/api/server.ts
- [X] T013 [US1] Garantir snapshot de nome, email, plano e assinatura nos payloads de eventos de assinatura em src/lib/api/server.ts
- [ ] T014 [US1] Validar manualmente nova assinatura, renovacao e cancelamento pelos passos 3 a 8 de specs/004-notificacoes-assinaturas/quickstart.md

**Checkpoint**: User Story 1 funcional como MVP, com eventos de assinatura exibidos como notificacoes administrativas derivadas.

---

## Phase 4: User Story 2 - Receber notificacao de novo usuario (Priority: P2)

**Goal**: Administradores recebem notificacao quando um novo usuario cadastrado aparece na base usada pelo painel admin.

**Independent Test**: Inserir ou sincronizar um usuario novo e verificar que o painel cria uma notificacao USER_CREATED com identificacao basica do usuario.

### Implementation for User Story 2

- [X] T015 [US2] Derivar notificacoes USER_CREATED a partir de User.createdAt em src/lib/api/server.ts
- [X] T016 [US2] Incluir usuarios novos na resposta de listAdminNotifications em src/lib/api/server.ts
- [X] T017 [US2] Garantir eventKey estavel por usuario cadastrado para evitar duplicidade em src/lib/api/server.ts
- [ ] T018 [US2] Validar manualmente novo usuario cadastrado pelos passos 9 e 10 de specs/004-notificacoes-assinaturas/quickstart.md

**Checkpoint**: User Story 2 funcional sem depender de uma tela de criacao de usuario no painel.

---

## Phase 5: User Story 3 - Consultar notificacoes recentes (Priority: P3)

**Goal**: Administradores conseguem abrir o sino do painel, consultar notificacoes recentes e diferenciar vistas de nao vistas.

**Independent Test**: Gerar notificacoes, abrir o sino, confirmar contador/lista, marcar itens como vistos, recarregar a pagina e conferir estado visual local.

### Implementation for User Story 3

- [X] T019 [P] [US3] Criar item visual reutilizavel para notificacao em src/components/notifications/admin-notification-item.tsx
- [X] T020 [US3] Criar popover/dropdown de notificacoes com carregamento, vazio, erro, contador e marcar como visto em src/components/notifications/admin-notifications-popover.tsx
- [X] T021 [US3] Substituir o botao estatico de sino pelo popover funcional no header de src/app/(dashboard)/layout.tsx
- [X] T022 [US3] Adicionar atualizacao periodica de ate 30 segundos para notificacoes recentes em src/components/notifications/admin-notifications-popover.tsx
- [ ] T023 [US3] Validar manualmente lista recente, vistos/nao vistos e reload pelos passos 11 e 12 de specs/004-notificacoes-assinaturas/quickstart.md

**Checkpoint**: User Story 3 funcional, com experiencia completa no header do painel admin.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Garantir acabamento, seguranca e validacao final da feature completa.

- [X] T024 Revisar mensagens exibidas nas notificacoes para clareza administrativa e ausencia de dados sensiveis desnecessarios em src/lib/api/server.ts
- [X] T025 Revisar responsividade e estados visuais do popover em src/components/notifications/admin-notifications-popover.tsx
- [X] T026 Rodar lint do projeto com npm run lint
- [X] T027 Rodar build do projeto com npm run build
- [ ] T028 Executar o roteiro completo de validacao em specs/004-notificacoes-assinaturas/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependencias.
- **Foundational (Phase 2)**: depende do Setup e bloqueia todas as user stories.
- **User Story 1 (Phase 3)**: depende da Foundational; e o MVP.
- **User Story 2 (Phase 4)**: depende da Foundational; pode ser feita depois do MVP.
- **User Story 3 (Phase 5)**: depende da Foundational; pode ser desenvolvida em paralelo com US1/US2 apos endpoints existirem, mas a validacao completa fica melhor depois de haver eventos reais.
- **Polish (Phase 6)**: depende das historias desejadas estarem completas.

### User Story Dependencies

- **US1 (P1)**: nao depende de US2 ou US3.
- **US2 (P2)**: nao depende de US1, mas usa a mesma infraestrutura de deduplicacao.
- **US3 (P3)**: nao depende da origem do evento, apenas dos endpoints de notificacoes.

### Within Each User Story

- Dados e servicos antes de endpoints.
- Endpoints antes de UI.
- UI antes de validacao manual completa.
- Cada historia deve passar pelo seu checkpoint antes de avancar como concluida.

### Parallel Opportunities

- T002 e T003 podem rodar em paralelo.
- T019 pode iniciar em paralelo com ajustes server-side depois que o contrato estiver definido.
- US1 e US2 podem ser implementadas em paralelo apos T004-T009 se houver cuidado com conflitos em src/lib/api/server.ts.
- T024 e T025 podem ser revisadas em paralelo antes de lint/build.

---

## Parallel Example: User Story 3

```text
Task: "Criar item visual reutilizavel para notificacao em src/components/notifications/admin-notification-item.tsx"
Task: "Preparar revisao de responsividade do popover em src/components/notifications/admin-notifications-popover.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate nova assinatura, renovacao e cancelamento.
5. Only then expand to new-user notifications and UI polish.

### Incremental Delivery

1. Setup + Foundation: tabela, tipos, servicos e endpoints.
2. US1: notificacoes de assinatura, ja entregando valor comercial principal.
3. US2: notificacao de usuario novo por reconciliacao server-side.
4. US3: experiencia completa no sino do painel admin.
5. Polish: mensagens, responsividade, lint, build e quickstart completo.

### Notes

- `[P]` indica tarefas em arquivos diferentes ou com dependencia minima.
- Todas as notificacoes desta feature sao internas ao painel admin.
- Push externo, email, SMS e notificacao nativa continuam fora do escopo.
- Evitar criar notificacao antes da operacao de negocio estar confirmada.
