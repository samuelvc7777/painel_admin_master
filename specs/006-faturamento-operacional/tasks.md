# Tasks: Faturamento Operacional

**Input**: Design documents from `/specs/006-faturamento-operacional/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-billing-contract.md, quickstart.md

**Tests**: A especificacao nao pediu TDD nem ha suite automatizada dedicada configurada. As tarefas incluem validacao por `npm run lint`, `npm run build` e quickstart manual.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar a estrutura da feature e confirmar os pontos de integracao atuais.

- [x] T001 Revisar a tela atual de faturamento em `src/app/(dashboard)/billing/page.tsx` e anotar os calculos locais que serao substituidos pelo contrato administrativo.
- [x] T002 [P] Revisar os tipos existentes de planos, usuarios e assinaturas em `src/lib/subscriptions.ts` antes de criar os tipos de faturamento.
- [x] T003 [P] Revisar a rota catch-all administrativa em `src/app/api/[[...path]]/route.ts` para mapear onde o endpoint `/admin/billing` sera registrado.
- [x] T004 Criar o barrel inicial dos componentes de billing em `src/components/billing/index.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar contrato, helpers e rota base que bloqueiam todas as historias.

**CRITICAL**: Nenhuma historia deve comecar antes desta fase estar completa.

- [x] T005 Criar os tipos `AdminBilling`, `BillingMetric`, `BillingPlanBreakdown`, `BillingEvent`, `BillingActionItem`, `BillingFilters` e `BillingSectionState` em `src/lib/billing.ts`.
- [x] T006 Implementar helpers de formatacao, normalizacao mensal de plano e validacao de filtros em `src/lib/billing.ts`.
- [x] T007 Implementar helpers de classificacao de assinatura paga ativa, trial, vencida, cancelada e troca de plano em `src/lib/billing.ts`.
- [x] T008 Adicionar a funcao server-side `getAdminBilling(filters)` em `src/lib/api/server.ts` consumindo usuarios hidratados, planos e notificacoes existentes.
- [x] T009 Registrar o endpoint GET `/admin/billing` em `src/app/api/[[...path]]/route.ts` com leitura de `periodDays`, `renewalWindowDays` e `planId`.
- [x] T010 Garantir que erros de filtro invalido em `/admin/billing` retornem mensagem administrativa clara em `src/app/api/[[...path]]/route.ts`.
- [x] T011 Atualizar imports compartilhados necessarios para billing em `src/lib/api/server.ts`.

**Checkpoint**: Fundacao pronta; `/admin/billing` retorna estrutura coerente mesmo antes da tela nova consumir todos os campos.

---

## Phase 3: User Story 1 - Ver receita real e assinantes atuais (Priority: P1) MVP

**Goal**: Administrador abre `/billing` e ve MRR estimado, receita anualizada, assinantes pagos, trials, novas assinaturas, cancelamentos e distribuicao por plano com dados atuais.

**Independent Test**: Com uma base contendo assinaturas ativas, trials e canceladas, abrir `/billing` e confirmar que canceladas nao somam no MRR, novas ativas entram nos totais e cada indicador tem explicacao.

### Implementation for User Story 1

- [x] T012 [US1] Calcular `estimated_mrr`, `estimated_arr`, `paid_subscribers`, `trial_subscribers`, `new_subscriptions`, `cancellations` e `renewals_due` em `src/lib/api/server.ts`.
- [x] T013 [US1] Calcular `planBreakdown` com assinantes pagos, trials, MRR estimado, participacao e contagens recentes em `src/lib/api/server.ts`.
- [x] T014 [US1] Criar o componente `BillingSummaryCards` em `src/components/billing/billing-summary-cards.tsx`.
- [x] T015 [P] [US1] Criar o componente `BillingPlanBreakdown` em `src/components/billing/billing-plan-breakdown.tsx`.
- [x] T016 [P] [US1] Criar o componente `BillingEmptyState` em `src/components/billing/billing-empty-state.tsx`.
- [x] T017 [P] [US1] Criar o componente `BillingSectionError` em `src/components/billing/billing-section-error.tsx`.
- [x] T018 [US1] Exportar os componentes de resumo, breakdown e estados em `src/components/billing/index.ts`.
- [x] T019 [US1] Refatorar `src/app/(dashboard)/billing/page.tsx` para consumir `/admin/billing` e renderizar resumo, breakdown por plano, carregamento e erro sem calculos locais de MRR.

**Checkpoint**: US1 funcional e testavel como MVP.

---

## Phase 4: User Story 2 - Entender por que a receita mudou (Priority: P2)

**Goal**: Administrador ve eventos auditaveis que explicam novas assinaturas, renovacoes, cancelamentos reais e trocas de plano.

**Independent Test**: Criar eventos recentes de assinatura nova, cancelamento e troca de plano; abrir `/billing` e conferir usuario, plano, data e impacto em cada evento.

### Implementation for User Story 2

- [x] T020 [US2] Montar `events` de assinatura criada, renovada e cancelada a partir de assinaturas/notificacoes em `src/lib/api/server.ts`.
- [x] T021 [US2] Implementar deteccao de `plan_changed` sem churn duplicado para substituicoes de plano em `src/lib/api/server.ts`.
- [x] T022 [US2] Calcular `impact` e `impactAmountCents` dos eventos de faturamento em `src/lib/api/server.ts`.
- [x] T023 [P] [US2] Criar o componente `BillingEventsTimeline` em `src/components/billing/billing-events-timeline.tsx`.
- [x] T024 [US2] Integrar a linha do tempo de eventos em `src/app/(dashboard)/billing/page.tsx`.
- [x] T025 [US2] Exportar `BillingEventsTimeline` em `src/components/billing/index.ts`.

**Checkpoint**: US1 e US2 funcionam juntas, e os totais podem ser explicados por eventos recentes.

---

## Phase 5: User Story 3 - Agir sobre riscos e oportunidades (Priority: P3)

**Goal**: Administrador tem uma fila curta com renovacoes proximas, clientes sem plano, cancelamentos recentes, planos sem receita e inconsistencias de dados.

**Independent Test**: Com assinaturas vencendo, usuario ativo sem plano e cancelamento recente, abrir `/billing` e confirmar que a fila mostra prioridades, links e estados vazios uteis.

### Implementation for User Story 3

- [x] T026 [US3] Montar `actionQueue` com renovacoes proximas, usuarios sem plano, cancelamentos recentes, planos sem receita e dados inconsistentes em `src/lib/api/server.ts`.
- [x] T027 [US3] Ordenar `actionQueue` por prioridade e data usando helper dedicado em `src/lib/billing.ts`.
- [x] T028 [P] [US3] Criar o componente `BillingActionQueue` em `src/components/billing/billing-action-queue.tsx`.
- [x] T029 [US3] Integrar `BillingActionQueue` em `src/app/(dashboard)/billing/page.tsx`.
- [x] T030 [US3] Exportar `BillingActionQueue` em `src/components/billing/index.ts`.

**Checkpoint**: US3 permite agir sobre riscos e oportunidades sem garimpar usuarios manualmente.

---

## Phase 6: User Story 4 - Filtrar e conferir detalhes por periodo e plano (Priority: P4)

**Goal**: Administrador filtra por periodo e plano, e consegue abrir os registros que compoem os indicadores.

**Independent Test**: Alterar periodo e plano em `/billing`; confirmar que resumo, breakdown, eventos e fila respeitam o recorte e que indicadores levam a usuarios, planos ou detalhes relevantes.

### Implementation for User Story 4

- [x] T031 [US4] Aplicar `periodDays`, `renewalWindowDays` e `planId` nos calculos de summary, planBreakdown, events e actionQueue em `src/lib/api/server.ts`.
- [x] T032 [P] [US4] Criar o componente `BillingFilters` em `src/components/billing/billing-filters.tsx`.
- [x] T033 [US4] Integrar `BillingFilters` com estado da URL e recarregamento de dados em `src/app/(dashboard)/billing/page.tsx`.
- [x] T034 [US4] Garantir `href` de drill-down em indicadores, eventos, planos e pendencias em `src/lib/api/server.ts`.
- [x] T035 [US4] Exportar `BillingFilters` em `src/components/billing/index.ts`.

**Checkpoint**: US4 torna a tela filtravel e auditavel por periodo, plano e registros relacionados.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento visual, consistencia operacional e verificacao.

- [x] T036 Revisar responsividade, densidade visual e ausencia de sobreposicoes em `src/app/(dashboard)/billing/page.tsx`.
- [x] T037 Revisar estados vazios e mensagens de erro parcial em `src/components/billing/billing-empty-state.tsx` e `src/components/billing/billing-section-error.tsx`.
- [x] T038 Verificar linguagem operacional brasileira e valores em reais nos componentes de `src/components/billing/`.
- [x] T039 Rodar `npm run lint` e corrigir problemas nos arquivos de billing e servidor relacionados a esta feature.
- [x] T040 Rodar `npm run build` e corrigir problemas nos arquivos de billing e servidor relacionados a esta feature.
- [ ] T041 Executar o roteiro de validacao manual de `specs/006-faturamento-operacional/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependencias.
- **Foundational (Phase 2)**: depende do Setup e bloqueia todas as historias.
- **US1 (Phase 3)**: depende da fundacao e entrega o MVP.
- **US2 (Phase 4)**: depende da fundacao; integra melhor depois de US1 porque usa a mesma tela e contrato.
- **US3 (Phase 5)**: depende da fundacao; integra melhor depois de US1 porque compartilha estados e dados.
- **US4 (Phase 6)**: depende da fundacao; deve ser feito apos US1/US2/US3 para filtrar todas as secoes.
- **Polish (Phase 7)**: depende das historias desejadas estarem completas.

### User Story Dependencies

- **User Story 1 (P1)**: MVP, sem dependencia de outras historias apos a fundacao.
- **User Story 2 (P2)**: independente em regra de negocio, mas integra visualmente na tela entregue por US1.
- **User Story 3 (P3)**: independente em regra de negocio, mas integra visualmente na tela entregue por US1.
- **User Story 4 (P4)**: depende das secoes que serao filtradas, portanto deve vir depois das historias que entram no filtro.

### Within Each User Story

- Tipos e helpers antes de calculos.
- Calculos server-side antes do endpoint.
- Endpoint antes da tela consumir dados.
- Componentes visuais podem ser criados em paralelo quando usam contrato ja definido.
- Integracao da page deve vir depois dos componentes e contrato minimo.

### Parallel Opportunities

- T002 e T003 podem rodar em paralelo.
- T014, T015, T016 e T017 podem rodar em paralelo depois de T005 a T013.
- T023 pode rodar em paralelo com T020 a T022 se o contrato de `BillingEvent` ja estiver definido.
- T028 pode rodar em paralelo com T026 a T027 se o contrato de `BillingActionItem` ja estiver definido.
- T032 pode rodar em paralelo com T031 se o contrato de filtros ja estiver definido.
- T039 e T040 devem rodar em sequencia no fechamento, apos as implementacoes desejadas.

---

## Parallel Example: User Story 1

```text
Task: "Criar o componente BillingSummaryCards em src/components/billing/billing-summary-cards.tsx"
Task: "Criar o componente BillingPlanBreakdown em src/components/billing/billing-plan-breakdown.tsx"
Task: "Criar o componente BillingEmptyState em src/components/billing/billing-empty-state.tsx"
Task: "Criar o componente BillingSectionError em src/components/billing/billing-section-error.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Criar o componente BillingEventsTimeline em src/components/billing/billing-events-timeline.tsx"
Task: "Montar eventos de assinatura criada, renovada e cancelada em src/lib/api/server.ts"
```

## Parallel Example: User Story 3

```text
Task: "Criar o componente BillingActionQueue em src/components/billing/billing-action-queue.tsx"
Task: "Ordenar actionQueue por prioridade e data em src/lib/billing.ts"
```

## Parallel Example: User Story 4

```text
Task: "Criar o componente BillingFilters em src/components/billing/billing-filters.tsx"
Task: "Aplicar periodDays, renewalWindowDays e planId em src/lib/api/server.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validar US1 abrindo `/billing` com assinaturas ativas, trials e canceladas.
5. Confirmar que cancelamentos saem do MRR e novas assinaturas entram nos totais.

### Incremental Delivery

1. Setup + Foundational -> contrato `/admin/billing` pronto.
2. US1 -> resumo confiavel e breakdown por plano.
3. US2 -> eventos auditaveis explicando mudancas.
4. US3 -> fila de riscos e oportunidades.
5. US4 -> filtros e drill-down.
6. Polish -> responsividade, linguagem, lint, build e quickstart.

### Parallel Team Strategy

1. Um desenvolvedor fecha `src/lib/billing.ts` e `src/lib/api/server.ts`.
2. Outro desenvolvedor cria componentes isolados em `src/components/billing/`.
3. A integracao em `src/app/(dashboard)/billing/page.tsx` ocorre quando contrato e componentes principais estiverem prontos.

---

## Notes

- [P] tasks = arquivos diferentes, sem dependencia em tarefas incompletas.
- [US1], [US2], [US3] e [US4] mapeiam diretamente as historias de `spec.md`.
- Evitar alterar a feature `005-dashboard-operacional` fora do necessario para compatibilidade.
- Preservar mudancas preexistentes no workspace; nao reverter arquivos modificados que nao pertencem a esta feature.
- Commits ficam fora deste fluxo porque o workspace ja possui alteracoes acumuladas.
