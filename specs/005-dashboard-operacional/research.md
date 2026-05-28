# Research: Dashboard Operacional

## Decision: Consolidar o calculo operacional no servidor

**Rationale**: O dashboard atual e a pagina de faturamento calculam parte dos mesmos dados no cliente, especialmente MRR, assinantes ativos, renovacoes e distribuicao por plano. Centralizar em `/admin/dashboard` reduz duplicidade, evita divergencia entre telas e permite que a UI trate apenas apresentacao, estados e links.

**Alternatives considered**:

- Manter calculos no cliente: rejeitado porque espalha regra de negocio e torna mais dificil garantir consistencia entre dashboard, faturamento e notificacoes.
- Criar uma tabela/materializacao de metricas: rejeitado para este corte porque os dados atuais parecem suficientes e a spec pede melhorar utilidade, nao criar camada analitica nova.

## Decision: Usar dados existentes antes de criar novas fontes

**Rationale**: A spec pede detalhes reais e uteis. As tabelas e contratos ja observados oferecem `User`, `Plan`, `Subscription`, notificacoes administrativas e possiveis eventos da Play Store. Isso cobre usuarios, assinantes, receita estimada, planos, vencimentos e eventos recentes.

**Alternatives considered**:

- Integrar ferramenta externa de analytics: rejeitado por ampliar escopo e depender de configuracao fora do painel.
- Criar mock ou placeholders visuais: rejeitado porque contradiz o requisito de nao ter coisas vazias ou inventadas.

## Decision: Separar dados financeiros como estimativa operacional

**Rationale**: O codigo atual calcula receita com base em assinaturas ativas e preco do plano. Isso e util para operacao, mas nao equivale a relatorio contabil. O dashboard deve rotular MRR/receita como estimativa para evitar interpretacao errada.

**Alternatives considered**:

- Chamar de faturamento real: rejeitado porque nao ha evidencia de conciliacao financeira completa.
- Remover dinheiro do dashboard: rejeitado porque receita e um dos principais sinais de saude do negocio.

## Decision: Dashboard em camadas de decisao

**Rationale**: Referencias de dashboards SaaS maduros priorizam poucos KPIs no topo, contexto logo abaixo e detalhe progressivo. Para este painel, a ordem mais util e: resumo executivo, plano/receita, pendencias operacionais, eventos recentes e lista curta de usuarios/acoes.

**Alternatives considered**:

- Tela com muitas tabelas: rejeitado porque aumenta carga cognitiva e piora uso mobile.
- Apenas cards grandes: rejeitado porque nao entrega acoes nem explica risco/oportunidade.

## Decision: Componentizar por secao visual

**Rationale**: A instrucao local pede que a view fique responsavel pela estrutura macro, extraindo secoes, cards e blocos visuais quando melhora manutencao. A nova dashboard tera varias secoes com estados de vazio/erro; separar componentes evita uma `page.tsx` gigante e facilita testes/ajustes visuais.

**Alternatives considered**:

- Manter tudo em `page.tsx`: rejeitado porque a tela ja tende a crescer e ficaria dificil de manter.
- Criar uma camada de design system nova: rejeitado porque o projeto ja tem padroes suficientes em Tailwind, `ResponsiveContainer` e componentes existentes.

## Decision: Estados parciais de erro e vazio

**Rationale**: A spec exige que uma falha parcial nao transforme a tela inteira em vazia. A API pode retornar secoes vazias por ausencia real de dados, enquanto a UI deve mostrar estados especificos por bloco.

**Alternatives considered**:

- Fallback silencioso para zeros: rejeitado porque esconde problemas e cria numeros enganosos.
- Bloquear toda a tela em qualquer falha: rejeitado porque reduz utilidade operacional quando parte dos dados ainda esta disponivel.
