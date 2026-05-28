# Implementation Plan: Dashboard Operacional

**Branch**: `005-dashboard-operacional` | **Date**: 2026-05-28 | **Spec**: [specs/005-dashboard-operacional/spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-dashboard-operacional/spec.md`

## Summary

Reformular a tela inicial do painel administrativo para deixar de ser uma vitrine de cards simples e virar um dashboard operacional util: resumo executivo, receita estimada, assinantes ativos, distribuicao por plano, eventos recentes e fila curta de pendencias. A abordagem tecnica sera consolidar o calculo em `/admin/dashboard`, tipar o contrato compartilhado, reaproveitar dados existentes de usuarios, planos, assinaturas e notificacoes, e refatorar `src/app/(dashboard)/page.tsx` para compor secoes menores em `src/components/dashboard/`.

## Technical Context

**Language/Version**: TypeScript, Next.js 16.1.6, React 19.2.3
**Primary Dependencies**: Next.js App Router, Supabase JS, lucide-react, Tailwind CSS ja configurado
**Storage**: Supabase existente como fonte de verdade para `User`, `Plan`, `Subscription` e eventos/notificacoes administrativas; sem nova tabela para esta feature
**Testing**: `npm run lint`, `npm run build` e validacao manual do fluxo em desktop/tablet/mobile
**Target Platform**: Web administrativo responsivo
**Project Type**: web-application com UI e rotas API no mesmo projeto
**Performance Goals**: dashboard legivel em ate 10 segundos para o administrador; dados do resumo carregando em tempo perceptivelmente imediato para bases administrativas normais; sem rolagem horizontal em larguras comuns
**Constraints**: somente administradores/atendentes autenticados; nao exibir cards vazios sem contexto; manter a view como estrutura macro e extrair secoes/cards/listas para componentes menores; evitar nova fonte de dados se os dados existentes forem suficientes
**Scale/Scope**: tela inicial do dashboard, contrato `/admin/dashboard`, tipos compartilhados, componentes visuais de dashboard, integracao com notificacoes recentes e links para usuarios/planos/faturamento

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituicao em `.specify/memory/constitution.md` ainda esta em formato template, sem principios concretos definidos para bloquear o plano. O gate normativo nao apresenta restricoes adicionais alem das instrucoes locais do projeto.

Resultado pre-Phase 0: **PASS**.

Recheck pos-Phase 1: **PASS**. O desenho preserva a arquitetura atual do painel, usa dados ja existentes, mantem acesso administrativo protegido, separa a pagina da composicao visual e evita expandir escopo para BI externo, contabilidade fechada ou nova persistencia.

## Project Structure

### Documentation (this feature)

```text
specs/005-dashboard-operacional/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- admin-dashboard-contract.md
+-- checklists/
|   +-- requirements.md
+-- tasks.md
```

### Source Code (repository root)

```text
src/
+-- app/
|   +-- (dashboard)/
|   |   +-- page.tsx
|   +-- api/
|       +-- [[...path]]/
|           +-- route.ts
+-- components/
|   +-- dashboard/
|   |   +-- dashboard-summary-cards.tsx
|   |   +-- dashboard-plan-distribution.tsx
|   |   +-- dashboard-operational-queue.tsx
|   |   +-- dashboard-recent-events.tsx
|   |   +-- dashboard-empty-state.tsx
|   |   +-- dashboard-section-error.tsx
|   +-- layout/
|       +-- responsive-container.tsx
+-- lib/
    +-- api/
    |   +-- client.ts
    |   +-- server.ts
    +-- dashboard.ts
    +-- notifications.ts
    +-- subscriptions.ts
```

**Structure Decision**: manter a feature no monolito Next.js existente. O calculo e agregacao operacional ficam em `src/lib/api/server.ts`, os tipos e helpers compartilhados em `src/lib/dashboard.ts`, o roteamento continua em `src/app/api/[[...path]]/route.ts`, e a tela `src/app/(dashboard)/page.tsx` passa a ser apenas orquestracao de carregamento e estrutura macro. Blocos visuais repetidos ou complexos ficam em `src/components/dashboard/`.

## Complexity Tracking

Sem violacoes que exijam justificativa.
