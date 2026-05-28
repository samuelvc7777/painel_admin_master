# Implementation Plan: Faturamento Operacional

**Branch**: `006-faturamento-operacional` | **Date**: 2026-05-28 | **Spec**: [specs/006-faturamento-operacional/spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-faturamento-operacional/spec.md`

## Summary

Reformular a tela de faturamento para deixar de depender de calculos locais simples e passar a exibir uma leitura operacional confiavel: MRR estimado, receita anualizada, assinantes pagos, trials, novas assinaturas, cancelamentos, renovacoes proximas, distribuicao por plano, eventos que explicam variacoes e fila curta de acoes. A abordagem tecnica sera criar um contrato dedicado de faturamento administrativo, centralizar os calculos no servidor a partir de usuarios, planos, assinaturas e notificacoes existentes, e refatorar a tela `src/app/(dashboard)/billing/page.tsx` para orquestrar o carregamento e compor secoes menores em `src/components/billing/`.

## Technical Context

**Language/Version**: TypeScript, Next.js 16.1.6, React 19.2.3
**Primary Dependencies**: Next.js App Router, Supabase JS, lucide-react, Tailwind CSS ja configurado
**Storage**: Supabase existente como fonte de verdade para `User`, `Plan`, `Subscription` e `GooglePlaySubscriptionEvent`; sem nova tabela prevista para esta feature
**Testing**: `npm run lint`, `npm run build` e validacao manual em desktop/tablet/mobile; testes automatizados dedicados nao estao configurados no projeto atual
**Target Platform**: Web administrativo responsivo
**Project Type**: web-application com UI e rotas API no mesmo projeto
**Performance Goals**: tela de faturamento compreensivel em ate 30 segundos para o administrador; dados carregando em tempo perceptivelmente imediato para bases administrativas normais; sem rolagem horizontal em larguras comuns
**Constraints**: acesso restrito a administradores/atendentes autenticados; nao exibir cards vazios sem contexto; cancelamentos e novas assinaturas devem alterar totais atuais; trocas de plano nao devem virar churn duplicado; manter page/view como estrutura macro e extrair secoes/cards/listas para componentes menores
**Scale/Scope**: rota administrativa de faturamento, tipos compartilhados, agregacao server-side, tela `/billing`, componentes visuais de billing, integracao com usuarios/planos/notificacoes e validacao de consistencia dos indicadores

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituicao em `.specify/memory/constitution.md` ainda esta em formato template, sem principios concretos definidos para bloquear o plano. O gate normativo nao apresenta restricoes adicionais alem das instrucoes locais do projeto.

Resultado pre-Phase 0: **PASS**.

Recheck pos-Phase 1: **PASS**. O desenho preserva a arquitetura atual do painel, usa dados ja existentes, mantem acesso administrativo protegido, separa a pagina da composicao visual e evita expandir escopo para contabilidade oficial, gateway externo ou nova persistencia.

## Project Structure

### Documentation (this feature)

```text
specs/006-faturamento-operacional/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- admin-billing-contract.md
+-- checklists/
|   +-- requirements.md
+-- tasks.md
```

### Source Code (repository root)

```text
src/
+-- app/
|   +-- (dashboard)/
|   |   +-- billing/
|   |       +-- page.tsx
|   +-- api/
|       +-- [[...path]]/
|           +-- route.ts
+-- components/
|   +-- billing/
|   |   +-- billing-summary-cards.tsx
|   |   +-- billing-plan-breakdown.tsx
|   |   +-- billing-events-timeline.tsx
|   |   +-- billing-action-queue.tsx
|   |   +-- billing-filters.tsx
|   |   +-- billing-empty-state.tsx
|   |   +-- billing-section-error.tsx
|   |   +-- index.ts
|   +-- layout/
|       +-- responsive-container.tsx
+-- lib/
    +-- api/
    |   +-- client.ts
    |   +-- server.ts
    +-- billing.ts
    +-- dashboard.ts
    +-- notifications.ts
    +-- subscriptions.ts
```

**Structure Decision**: manter a feature no monolito Next.js existente. A rota API continua concentrada em `src/app/api/[[...path]]/route.ts`, com um endpoint administrativo dedicado a faturamento. Calculos, tipos e helpers de faturamento ficam em `src/lib/billing.ts` e `src/lib/api/server.ts`. A tela `src/app/(dashboard)/billing/page.tsx` deve ficar responsavel por estado de carregamento, filtros e estrutura macro; blocos visuais, cards, listas e estados ficam em `src/components/billing/`.

## Complexity Tracking

Sem violacoes que exijam justificativa.
