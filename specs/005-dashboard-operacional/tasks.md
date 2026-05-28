# Tasks: Dashboard Operacional

**Input**: Design documents from `/specs/005-dashboard-operacional/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-dashboard-contract.md, quickstart.md

**Tests**: A especificacao nao solicitou TDD nem testes automatizados obrigatorios. A validacao prevista e `npm run lint`, `npm run build` e checklist manual do quickstart.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo quando mexe em arquivos diferentes e nao depende de tarefa incompleta.
- **[Story]**: Qual user story a tarefa entrega.
- Todas as tarefas incluem caminho exato de arquivo.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estrutura da feature sem alterar comportamento ainda.

- [x] T001 Criar a pasta de componentes do dashboard em `src/components/dashboard/`
- [x] T002 [P] Criar barril de exportacao dos componentes do dashboard em `src/components/dashboard/index.ts`
- [x] T003 [P] Revisar o contrato esperado de `/admin/dashboard` em `specs/005-dashboard-operacional/contracts/admin-dashboard-contract.md` antes de codar a resposta final

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, helpers e contrato compartilhado que bloqueiam todas as user stories.

**CRITICAL**: Nenhuma user story deve comecar antes desta fase estar completa.

- [x] T004 Criar os tipos `DashboardOperacional`, `OperationalMetric`, `PlanDistributionItem`, `OperationalQueueItem`, `RecentOperationalEvent` e `DashboardSectionState` em `src/lib/dashboard.ts`
- [x] T005 Criar helpers de formatacao de moeda, percentual, datas relativas e ordenacao de prioridade em `src/lib/dashboard.ts`
- [x] T006 Criar helpers de classificacao de assinatura ativa, trial, cancelada, vencida e proxima do vencimento em `src/lib/dashboard.ts`
- [x] T007 Atualizar o tipo de retorno de `getDashboard()` para usar `DashboardOperacional` em `src/lib/api/server.ts`
- [x] T008 Garantir que `GET /admin/dashboard` continue protegido por `requireAdminFromToken` em `src/app/api/[[...path]]/route.ts`

**Checkpoint**: Tipos e contrato base prontos; user stories podem ser implementadas.

---

## Phase 3: User Story 1 - Entender a saude do negocio em poucos segundos (Priority: P1) MVP

**Goal**: Administrador abre `/` e ve usuarios, assinantes, receita estimada e novos cadastros com contexto real, sem cards vazios.

**Independent Test**: Abrir `/` com base populada e confirmar que os indicadores principais aparecem com valores reais, periodo/contexto e estado vazio honesto quando faltar dado.

### Implementation for User Story 1

- [x] T009 [US1] Implementar calculo de `summary` com usuarios totais, usuarios ativos, assinantes ativos, novos usuarios recentes e receita mensal estimada em `src/lib/api/server.ts`
- [x] T010 [US1] Implementar `sectionStates` para resumo vazio ou indisponivel em `src/lib/api/server.ts`
- [x] T011 [P] [US1] Criar componente de card de metrica operacional em `src/components/dashboard/dashboard-metric-card.tsx`
- [x] T012 [P] [US1] Criar grade de indicadores principais em `src/components/dashboard/dashboard-summary-cards.tsx`
- [x] T013 [P] [US1] Criar estado vazio reutilizavel em `src/components/dashboard/dashboard-empty-state.tsx`
- [x] T014 [P] [US1] Criar estado de erro de secao em `src/components/dashboard/dashboard-section-error.tsx`
- [x] T015 [US1] Refatorar `src/app/(dashboard)/page.tsx` para buscar apenas `/admin/dashboard` e renderizar o resumo com `DashboardSummaryCards`
- [x] T016 [US1] Remover da tela inicial o fallback silencioso para zeros em `src/app/(dashboard)/page.tsx`

**Checkpoint**: MVP funcional e testavel independentemente.

---

## Phase 4: User Story 2 - Acompanhar assinaturas e receita de forma acionavel (Priority: P2)

**Goal**: Dashboard mostra distribuicao por plano, receita estimada por plano e eventos recentes de assinatura/cadastro.

**Independent Test**: Com clientes em planos diferentes e eventos recentes, abrir `/` e confirmar plano, quantidade, receita estimada, eventos e links corretos sem abrir outras telas.

### Implementation for User Story 2

- [x] T017 [US2] Implementar `planDistribution` com assinantes ativos, receita estimada em centavos, percentual e link do plano em `src/lib/api/server.ts`
- [x] T018 [US2] Implementar `recentEvents` a partir de usuarios, assinaturas e notificacoes administrativas existentes em `src/lib/api/server.ts`
- [x] T019 [US2] Garantir que eventos recentes fiquem ordenados do mais recente para o mais antigo em `src/lib/api/server.ts`
- [x] T020 [P] [US2] Criar componente de distribuicao por plano em `src/components/dashboard/dashboard-plan-distribution.tsx`
- [x] T021 [P] [US2] Criar componente de eventos recentes em `src/components/dashboard/dashboard-recent-events.tsx`
- [x] T022 [US2] Integrar distribuicao por plano e eventos recentes na estrutura de `src/app/(dashboard)/page.tsx`
- [x] T023 [US2] Garantir estados vazios explicativos para plano e eventos em `src/components/dashboard/dashboard-plan-distribution.tsx`

**Checkpoint**: Assinaturas e receita aparecem de forma acionavel sem depender da pagina de faturamento.

---

## Phase 5: User Story 3 - Encontrar proximas acoes sem procurar em varias telas (Priority: P3)

**Goal**: Dashboard exibe uma fila curta de pendencias e oportunidades com prioridade e destino claro.

**Independent Test**: Com usuarios novos sem plano, vencimentos proximos, cancelamentos e notificacoes nao vistas, abrir `/` e confirmar que a fila mostra itens acionaveis com link para usuario/plano/faturamento/notificacoes.

### Implementation for User Story 3

- [x] T024 [US3] Implementar `operationalQueue` para usuarios sem plano, renovacoes proximas, cancelamentos recentes e notificacoes relevantes em `src/lib/api/server.ts`
- [x] T025 [US3] Aplicar ordenacao por prioridade e data nos itens de `operationalQueue` em `src/lib/api/server.ts`
- [x] T026 [P] [US3] Criar componente da fila operacional em `src/components/dashboard/dashboard-operational-queue.tsx`
- [x] T027 [US3] Integrar fila operacional na estrutura principal em `src/app/(dashboard)/page.tsx`
- [x] T028 [US3] Garantir que cada item da fila operacional tenha texto de acao e `href` valido em `src/components/dashboard/dashboard-operational-queue.tsx`

**Checkpoint**: Administrador consegue sair do dashboard para a proxima acao em um clique.

---

## Phase 6: User Story 4 - Usar o dashboard em desktop e telas menores sem perder leitura (Priority: P4)

**Goal**: Dashboard permanece legivel e acionavel em desktop, notebook, tablet e celular.

**Independent Test**: Abrir `/` em larguras de desktop, tablet e celular e confirmar que indicadores, listas, acoes e textos essenciais nao sobrepoem, nao cortam e nao exigem rolagem horizontal confusa.

### Implementation for User Story 4

- [x] T029 [US4] Ajustar composicao responsiva da tela inicial em `src/app/(dashboard)/page.tsx`
- [x] T030 [US4] Ajustar grid e quebra de conteudo dos cards em `src/components/dashboard/dashboard-summary-cards.tsx`
- [x] T031 [US4] Ajustar comportamento responsivo da distribuicao por plano em `src/components/dashboard/dashboard-plan-distribution.tsx`
- [x] T032 [US4] Ajustar comportamento responsivo da fila operacional e eventos recentes em `src/components/dashboard/dashboard-operational-queue.tsx`
- [x] T033 [US4] Revisar classes globais reutilizadas para evitar rolagem horizontal em `src/app/globals.css`

**Checkpoint**: Dashboard responsivo sem regressao visual evidente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validacao, limpeza e alinhamento final.

- [x] T034 Atualizar exportacoes dos componentes criados em `src/components/dashboard/index.ts`
- [x] T035 Revisar textos administrativos, acentos e rotulos de estimativa financeira em `src/components/dashboard/`
- [x] T036 Verificar que `src/app/(dashboard)/page.tsx` ficou responsavel apenas por carregamento e estrutura macro
- [x] T037 Executar `npm run lint` na raiz do projeto `C:\Users\Samuel Vitor\Documents\aplicativos\painel_admin_master`
- [x] T038 Executar `npm run build` na raiz do projeto `C:\Users\Samuel Vitor\Documents\aplicativos\painel_admin_master`
- [ ] T039 Validar manualmente os cenarios de `specs/005-dashboard-operacional/quickstart.md`
- [x] T040 Registrar no final da implementacao qualquer limitacao real encontrada em `specs/005-dashboard-operacional/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependencias.
- **Foundational (Phase 2)**: depende do Setup e bloqueia todas as user stories.
- **US1 (Phase 3)**: depende da Foundational e e o MVP.
- **US2 (Phase 4)**: depende da Foundational; pode ser implementada apos ou em paralelo com US1, mas a integracao visual fica mais simples depois do shell de US1.
- **US3 (Phase 5)**: depende da Foundational; integra melhor apos US1.
- **US4 (Phase 6)**: depende dos blocos visuais das historias escolhidas.
- **Polish (Phase 7)**: depende das historias implementadas.

### User Story Dependencies

- **User Story 1 (P1)**: independente apos Foundational; define o shell MVP do dashboard.
- **User Story 2 (P2)**: independente no backend apos Foundational; composicao visual pode reaproveitar shell da US1.
- **User Story 3 (P3)**: independente no backend apos Foundational; composicao visual pode reaproveitar shell da US1.
- **User Story 4 (P4)**: depende dos componentes visuais que precisam ser responsivos.

### Parallel Opportunities

- T002 e T003 podem rodar em paralelo.
- T011, T012, T013 e T014 podem rodar em paralelo apos T004.
- T020 e T021 podem rodar em paralelo apos T017 e T018 terem o contrato definido.
- T026 pode rodar em paralelo com T024 quando o formato de `OperationalQueueItem` ja estiver definido.
- Ajustes responsivos por componente em T030, T031 e T032 podem ser feitos em paralelo.

---

## Parallel Example: User Story 1

```text
Task: "Criar componente de card de metrica operacional em src/components/dashboard/dashboard-metric-card.tsx"
Task: "Criar grade de indicadores principais em src/components/dashboard/dashboard-summary-cards.tsx"
Task: "Criar estado vazio reutilizavel em src/components/dashboard/dashboard-empty-state.tsx"
Task: "Criar estado de erro de secao em src/components/dashboard/dashboard-section-error.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Criar componente de distribuicao por plano em src/components/dashboard/dashboard-plan-distribution.tsx"
Task: "Criar componente de eventos recentes em src/components/dashboard/dashboard-recent-events.tsx"
```

## Parallel Example: User Story 4

```text
Task: "Ajustar grid e quebra de conteudo dos cards em src/components/dashboard/dashboard-summary-cards.tsx"
Task: "Ajustar comportamento responsivo da distribuicao por plano em src/components/dashboard/dashboard-plan-distribution.tsx"
Task: "Ajustar comportamento responsivo da fila operacional e eventos recentes em src/components/dashboard/dashboard-operational-queue.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 e Phase 2.
2. Implementar US1 para entregar resumo executivo real.
3. Validar `/` com base populada e base vazia.
4. Rodar `npm run lint` e corrigir problemas antes de expandir.

### Incremental Delivery

1. US1 entrega valor imediato: dashboard deixa de ser vazio/decorativo.
2. US2 adiciona visao comercial de assinaturas e receita por plano.
3. US3 transforma o dashboard em lista de proximas acoes.
4. US4 garante que o resultado sirva no uso real em varias larguras.

### Final Validation

1. Rodar `npm run lint`.
2. Rodar `npm run build`.
3. Validar `specs/005-dashboard-operacional/quickstart.md`.
4. Conferir que a tela nao depende de buscar `/user` para montar os principais blocos do dashboard.
