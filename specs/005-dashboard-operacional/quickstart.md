# Quickstart: Dashboard Operacional

## 1. Preparar ambiente

```powershell
npm install
```

Garanta que as variaveis do Supabase usadas pelo painel estejam configuradas no ambiente local.

## 2. Rodar verificacoes iniciais

```powershell
npm run lint
npm run build
```

## 3. Executar o painel

```powershell
npm run dev
```

Acesse o endereco local exibido pelo Next.js e entre com um usuario administrativo.

## 4. Validar o contrato do dashboard

- Abrir a tela inicial `/`.
- Confirmar que a tela carrega sem depender de buscar `/user` para montar os indicadores principais.
- Confirmar que `/admin/dashboard` retorna resumo, distribuicao por plano, fila operacional, eventos recentes e estados por secao.

## 5. Validar cenarios com dados

- Base com usuarios e assinaturas ativas: resumo mostra usuarios, assinantes e receita estimada.
- Base com usuarios sem plano: fila operacional mostra oportunidades/pendencias.
- Base com assinaturas proximas do vencimento: fila mostra vencimentos em ate 7 dias.
- Base com cancelamentos ou notificacoes recentes: eventos recentes aparecem com usuario, plano e data aproximada.
- Base vazia: dashboard mostra estados iniciais uteis, sem cards mudos ou listas vazias sem explicacao.

## 6. Validar responsividade

Testar pelo menos:

- Desktop largo.
- Notebook comum.
- Tablet.
- Celular.

Em todos os tamanhos, nao deve existir texto essencial cortado, botoes sobrepostos ou rolagem horizontal para entender a tela.

## 7. Validar estados de falha

Simular erro ou indisponibilidade de uma parte dos dados e confirmar que:

- A tela informa qual secao falhou.
- As demais secoes continuam compreensiveis quando houver dados.
- Nao ha fallback silencioso para zeros enganosos.

## Resultado da validacao nesta implementacao

- `npm run lint`: aprovado em 2026-05-28.
- `npm run build`: aprovado em 2026-05-28.
- Browser local: o app abriu em `http://127.0.0.1:3000/`, redirecionou corretamente para `/login` por falta de sessao administrativa, sem erros de console observados na tela de login e sem rolagem horizontal em 1280px.
- Limitacao: os cenarios autenticados da dashboard nao foram validados visualmente nesta sessao porque nao havia credenciais/sessao administrativa disponivel no navegador.
