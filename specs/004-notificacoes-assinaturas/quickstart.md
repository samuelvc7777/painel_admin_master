# Quickstart: Notificacoes de Assinaturas e Cadastros

## Objetivo

Validar que o painel admin mostra notificacoes internas para nova assinatura, renovacao, cancelamento e novo usuario cadastrado.

## Pre-requisitos

- Variaveis de Supabase configuradas em `.env.local`.
- Usuario administrador ou atendente com acesso ao painel.
- Tabelas existentes `User`, `Subscription` e `Plan` acessiveis pelo painel.

## Validacao manual

1. Inicie o painel:

```powershell
npm run dev
```

2. Acesse o painel com um usuario administrativo.

3. Gere uma nova assinatura para um cliente pelo fluxo existente de planos/usuario.

4. Confirme que o sino no header indica notificacao nao vista e que a lista mostra o cliente e o tipo "nova assinatura".

5. Renove uma assinatura ativa.

6. Confirme que aparece uma notificacao de renovacao sem duplicar eventos anteriores.

7. Cancele uma assinatura ativa.

8. Confirme que aparece uma notificacao de cancelamento.

9. Cadastre ou sincronize um novo usuario na base usada pelo painel.

10. Confirme que aparece uma notificacao de novo usuario cadastrado.

11. Marque uma notificacao como vista e confirme que o contador de nao vistas diminui.

12. Recarregue a pagina e confirme que notificacoes recentes continuam disponiveis.

## Validacao tecnica

```powershell
npm run lint
npm run build
```

## Resultado esperado

- Eventos confirmados aparecem como notificacoes derivadas das tabelas existentes.
- O sino do painel admin reflete notificacoes nao vistas.
- A lista recente exibe tipo, pessoa/cliente relacionado e horario.
- Notificacoes vistas e nao vistas ficam visualmente diferenciadas no navegador do administrador.
