# Implementation Plan: Notificacoes de Assinaturas e Cadastros

**Branch**: `004-notificacoes-assinaturas` | **Date**: 2026-05-28 | **Spec**: [specs/004-notificacoes-assinaturas/spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-notificacoes-assinaturas/spec.md`

## Summary

Adicionar notificacoes administrativas dentro do painel admin para eventos confirmados de nova assinatura, renovacao, cancelamento e novo usuario cadastrado. A abordagem sera derivar a lista das tabelas ja existentes no Supabase (`User` e `Subscription`) e controlar visto/nao visto no navegador do administrador, evitando nova migration neste primeiro corte.

## Technical Context

**Language/Version**: TypeScript, Next.js 16.1.6, React 19.2.3
**Primary Dependencies**: Next.js App Router, Supabase JS, lucide-react, Tailwind CSS ja configurado
**Storage**: Supabase existente para origem dos eventos; `localStorage` do navegador para estado visto/nao visto
**Testing**: `npm run lint`, `npm run build` e validacao manual do fluxo no painel admin
**Target Platform**: Web administrativo
**Project Type**: web-application com UI e rotas API no mesmo projeto
**Performance Goals**: notificacoes novas visiveis em ate 30 segundos; lista recente carregando em tempo perceptivelmente imediato para uso administrativo
**Constraints**: somente administradores/atendentes autenticados podem consultar; nao criar duplicidade visual para o mesmo evento derivado; canais externos ficam fora do escopo
**Scale/Scope**: header do dashboard, area/dropdown de notificacoes, endpoints administrativos e pontos de criacao nos eventos de assinatura/cadastro

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constituicao em `.specify/memory/constitution.md` ainda esta em formato template sem principios efetivamente definidos. Portanto, nao ha gates normativos concretos para bloquear o plano.

Resultado pre-Phase 0: **PASS**.

Recheck pos-Phase 1: **PASS**. O desenho segue as restricoes locais observadas: escopo no painel admin, acesso protegido por `requireAdminFromToken`, UI integrada ao layout existente e sem nova tabela para notificacoes.

## Project Structure

### Documentation (this feature)

```text
specs/004-notificacoes-assinaturas/
+-- plan.md
+-- research.md
+-- data-model.md
+-- quickstart.md
+-- contracts/
|   +-- admin-notifications-contract.md
+-- tasks.md
```

### Source Code (repository root)

```text
src/
+-- app/
|   +-- (dashboard)/
|   |   +-- layout.tsx
|   +-- api/
|       +-- [[...path]]/
|           +-- route.ts
+-- components/
|   +-- notifications/
|       +-- admin-notifications-popover.tsx
|       +-- admin-notification-item.tsx
+-- lib/
    +-- api/
    |   +-- client.ts
    |   +-- server.ts
    +-- notifications.ts
    +-- subscriptions.ts
```

**Structure Decision**: manter a feature dentro do monolito Next.js atual. A montagem e leitura das notificacoes derivadas ficam em `src/lib/api/server.ts` e `src/app/api/[[...path]]/route.ts`, os tipos compartilhados em `src/lib/notifications.ts`, e a composicao visual do sino/lista em componentes dedicados sob `src/components/notifications/`, mantendo o layout responsavel pela estrutura macro.

## Complexity Tracking

Sem violacoes que exijam justificativa.
