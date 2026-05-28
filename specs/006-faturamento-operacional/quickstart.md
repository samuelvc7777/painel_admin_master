# Quickstart: Faturamento Operacional

## Objetivo

Validar que a tela `/billing` exibe faturamento realista e acionavel, com cancelamentos removendo receita atual e novas assinaturas entrando nos indicadores.

## Pre-requisitos

- Variaveis de Supabase configuradas para o painel.
- Usuario autenticado com papel administrativo ou atendente.
- Base com usuarios, planos e assinaturas suficientes para validar os cenarios.

## Execucao local

```powershell
npm run dev
```

Abrir o painel e acessar:

```text
http://localhost:3000/billing
```

## Validacao funcional

1. Abrir `/billing` com uma base que possua assinaturas ativas.
2. Confirmar que MRR estimado, assinantes pagos, trials, novas assinaturas, cancelamentos e renovacoes proximas aparecem com labels claros.
3. Cancelar uma assinatura ativa em um usuario.
4. Recarregar `/billing`.
5. Confirmar que a assinatura cancelada saiu de MRR e assinantes pagos, mas apareceu como evento recente ou pendencia.
6. Criar ou trocar uma assinatura para um plano ativo.
7. Recarregar `/billing`.
8. Confirmar que os totais, breakdown por plano e eventos recentes refletem a nova assinatura.
9. Filtrar por plano e confirmar que resumo, eventos e pendencias respeitam o recorte.
10. Testar uma base sem assinaturas ativas e confirmar que os estados vazios explicam o motivo e indicam proxima acao.

## Validacao responsiva

Conferir a tela em larguras comuns:

- Desktop largo.
- Notebook.
- Tablet.
- Celular.

Nao deve haver rolagem horizontal, texto sobreposto ou cards vazios sem contexto.

## Comandos de verificacao

```powershell
npm run lint
npm run build
```

## Criterios de pronto

- Cancelamento real reduz MRR e assinantes pagos.
- Nova assinatura aumenta MRR, assinantes pagos e plano correspondente.
- Troca de plano nao aparece como churn duplicado.
- Pelo menos os indicadores principais possuem caminho para detalhes.
- Estados vazios sao uteis e acionaveis.
- Tela permanece legivel em desktop, tablet e celular.
