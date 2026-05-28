# Feature Specification: Dashboard Operacional

**Feature Branch**: `005-dashboard-operacional`
**Created**: 2026-05-28
**Status**: Draft
**Input**: User description: "bora criar uma dashboard melhor, com detalhes reais e coisas uteis e nao vazias, pegue referencia do melhor dashboard do mercado"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender a saude do negocio em poucos segundos (Priority: P1)

Como administrador, quero abrir o painel inicial e entender rapidamente como estao usuarios, assinaturas e receita, para saber se o negocio esta crescendo, parado ou exigindo acao.

**Why this priority**: O dashboard e a primeira tela operacional do painel; se ele nao mostrar sinais reais de receita, base ativa e mudancas recentes, ele vira decoracao e nao ajuda a tomada de decisao.

**Independent Test**: Pode ser testada acessando o dashboard com uma base que tenha usuarios, planos e assinaturas, verificando se os indicadores principais aparecem com valores reais, contexto de periodo e leitura clara de tendencia.

**Acceptance Scenarios**:

1. **Given** que existem usuarios e assinaturas cadastrados, **When** o administrador abre o dashboard, **Then** ele ve os principais indicadores de usuarios, assinantes, receita estimada e novos cadastros com valores reais.
2. **Given** que houve variacao recente na base, **When** o dashboard e carregado, **Then** cada indicador principal mostra contexto comparativo ou explicacao suficiente para o administrador interpretar o numero.
3. **Given** que algum indicador nao possui dados suficientes, **When** o dashboard e exibido, **Then** a tela explica o motivo e nao mostra card vazio ou numero enganoso.

---

### User Story 2 - Acompanhar assinaturas e receita de forma acionavel (Priority: P2)

Como administrador, quero enxergar a distribuicao de planos, assinaturas vencendo, cancelamentos e renovacoes recentes, para agir antes que receita ou atendimento sejam prejudicados.

**Why this priority**: Assinaturas sao o centro financeiro do painel; mostrar apenas receita total nao ajuda a operar renovacao, retencao e suporte.

**Independent Test**: Pode ser testada com clientes em diferentes planos e status, verificando se o dashboard destaca distribuicao por plano, eventos recentes e casos que pedem acompanhamento.

**Acceptance Scenarios**:

1. **Given** que existem assinaturas ativas em planos diferentes, **When** o administrador consulta o dashboard, **Then** ele ve a distribuicao por plano com quantidade de clientes e receita estimada por plano.
2. **Given** que existem assinaturas canceladas, vencidas ou proximas do vencimento, **When** o dashboard e carregado, **Then** esses riscos aparecem em uma area de atencao com prioridade visual proporcional ao impacto.
3. **Given** que uma assinatura foi criada, renovada ou cancelada recentemente, **When** o administrador olha o resumo operacional, **Then** ele consegue identificar o cliente, o plano e o tipo de evento sem abrir outra tela.

---

### User Story 3 - Encontrar proximas acoes sem procurar em varias telas (Priority: P3)

Como administrador ou atendente, quero ver no dashboard uma fila curta de acoes uteis, para decidir rapidamente quem precisa de contato, validacao, renovacao ou revisao.

**Why this priority**: Um bom dashboard nao e so um mural de numeros; ele deve reduzir o tempo ate a proxima decisao operacional.

**Independent Test**: Pode ser testada populando a base com usuarios novos, usuarios sem plano, assinaturas recentes e notificacoes administrativas, verificando se a tela sugere acoes concretas e links para os detalhes corretos.

**Acceptance Scenarios**:

1. **Given** que existem usuarios novos sem assinatura ativa, **When** o dashboard e aberto, **Then** esses usuarios aparecem como oportunidades ou pendencias de acompanhamento.
2. **Given** que existem notificacoes administrativas nao vistas, **When** o dashboard e aberto, **Then** o resumo destaca os eventos importantes sem duplicar ou esconder informacao do sino de notificacoes.
3. **Given** que o administrador escolhe um item de acao, **When** ele aciona o item, **Then** o painel o leva ao detalhe relevante do usuario, plano, assinatura ou area de gestao.

---

### User Story 4 - Usar o dashboard em desktop e telas menores sem perder leitura (Priority: P4)

Como administrador, quero que o dashboard continue organizado em telas grandes, notebooks e celulares, para usar o painel sem tabelas esmagadas, cards quebrados ou informacao escondida.

**Why this priority**: O painel administrativo ja tem preocupacao responsiva; o dashboard novo precisa preservar a mesma qualidade visual para nao regredir a experiencia.

**Independent Test**: Pode ser testada abrindo o dashboard em larguras de desktop, tablet e celular, verificando se os indicadores, listas e graficos continuam legiveis e acionaveis.

**Acceptance Scenarios**:

1. **Given** que o administrador usa uma tela estreita, **When** o dashboard e carregado, **Then** os blocos principais reorganizam a ordem sem sobrepor textos ou esconder acoes essenciais.
2. **Given** que uma lista tem muitos dados, **When** a largura e reduzida, **Then** o dashboard prioriza resumo e acoes principais em vez de exigir rolagem horizontal confusa.

### Edge Cases

- Se a base estiver vazia, o dashboard deve mostrar estado inicial util com proximas acoes reais, nao cards genericos preenchidos com zero sem contexto.
- Se a consulta de uma parte dos dados falhar, o dashboard deve manter as demais secoes funcionais e indicar claramente qual informacao nao pode ser carregada.
- Se um plano estiver inativo, ele deve ser tratado separadamente para nao distorcer receita ativa nem esconder historico recente.
- Se um usuario tiver assinatura em teste, ativa, cancelada ou vencida, os indicadores devem classificar o status de forma consistente.
- Se houver muitos eventos recentes, o dashboard deve priorizar os mais importantes e oferecer caminho para ver a lista completa.
- Se valores financeiros forem estimados, a tela deve sinalizar que sao estimativas e evitar aparencia de relatorio contabil fechado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O dashboard MUST exibir um resumo executivo com no minimo usuarios totais, usuarios ativos, assinantes ativos, novos usuarios recentes e receita recorrente estimada.
- **FR-002**: O dashboard MUST apresentar cada indicador principal com contexto de periodo, variacao ou descricao operacional que ajude a interpretar o numero.
- **FR-003**: O dashboard MUST diferenciar usuarios ativos de assinantes ativos, evitando misturar atividade de conta com status comercial.
- **FR-004**: O dashboard MUST mostrar distribuicao de assinaturas por plano, incluindo quantidade de clientes e receita estimada por plano quando houver dados disponiveis.
- **FR-005**: O dashboard MUST destacar eventos recentes de assinatura e cadastro com pessoa relacionada, plano quando aplicavel, tipo de evento e momento aproximado.
- **FR-006**: O dashboard MUST destacar riscos ou pendencias operacionais, como usuarios sem plano, assinaturas canceladas recentemente, assinaturas proximas do vencimento ou clientes que exigem acompanhamento.
- **FR-007**: O dashboard MUST oferecer atalhos contextuais para as areas relevantes, como detalhes do usuario, gestao de planos, faturamento e notificacoes.
- **FR-008**: O dashboard MUST incluir estados vazios uteis para secoes sem dados, explicando o que falta e qual acao administrativa faz sentido em seguida.
- **FR-009**: O dashboard MUST incluir estados de carregamento e erro por secao, para que uma falha parcial nao transforme a tela inteira em vazia.
- **FR-010**: O dashboard MUST evitar metricas decorativas ou cards sem dado real; todo bloco visivel deve responder a uma pergunta operacional clara.
- **FR-011**: O dashboard MUST ordenar informacoes por importancia, colocando os indicadores mais criticos no topo e detalhes mais granulares abaixo.
- **FR-012**: O dashboard MUST manter legibilidade e acoes essenciais em desktop, notebook, tablet e celular.
- **FR-013**: O dashboard MUST restringir a visualizacao dos dados a usuarios administrativos autenticados.
- **FR-014**: O dashboard MUST usar linguagem administrativa direta, com rotulos claros para estimativas, periodos e status.
- **FR-015**: O dashboard MUST permitir que o administrador identifique, sem abrir outra tela, quais numeros indicam crescimento, receita, risco ou oportunidade.

### Key Entities *(include if feature involves data)*

- **Indicador Operacional**: Numero resumido exibido no dashboard, com nome, valor, periodo, contexto de interpretacao e possivel variacao.
- **Usuario Administrativo**: Pessoa autenticada com permissao para consultar o painel e tomar acoes de gestao.
- **Usuario do Produto**: Cliente ou usuario final acompanhado pelo painel, com status de conta, dados de cadastro e relacionamento com assinaturas.
- **Assinatura**: Relacao comercial entre usuario e plano, com status, datas de inicio e fim, renovacao, cancelamento e plano associado.
- **Plano**: Oferta comercial que define nome, preco, duracao, status e contribuicao estimada para a receita.
- **Evento Operacional**: Acontecimento recente relevante para o administrador, como novo cadastro, nova assinatura, renovacao ou cancelamento.
- **Pendencia Operacional**: Item que pede atencao administrativa, como cliente sem plano, vencimento proximo, cancelamento recente ou notificacao nao vista.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores conseguem identificar o estado geral de usuarios, assinaturas e receita em ate 10 segundos apos o dashboard carregar.
- **SC-002**: 100% dos blocos principais exibidos no dashboard possuem dado real, estado vazio explicativo ou erro claro; nenhum card fica visualmente vazio sem contexto.
- **SC-003**: Pelo menos 90% dos principais caminhos operacionais do dashboard levam o administrador ao detalhe ou tela correspondente em um unico clique.
- **SC-004**: Em testes de aceitacao com base populada, 95% dos eventos recentes exibidos mostram corretamente pessoa relacionada, tipo do evento e data aproximada.
- **SC-005**: Em larguras comuns de desktop, notebook, tablet e celular, nenhum texto essencial ou botao principal fica sobreposto, cortado ou dependente de rolagem horizontal.
- **SC-006**: O dashboard reduz em pelo menos 40% o tempo necessario para encontrar usuarios sem plano, cancelamentos recentes ou assinaturas que pedem acompanhamento, comparado ao fluxo de procurar manualmente em listas.
- **SC-007**: Administradores classificam o dashboard como util para a rotina operacional em pelo menos 4 de 5 em validacao interna.

## Assumptions

- O publico principal da tela e composto por administradores e atendentes que precisam operar usuarios, planos, assinaturas, faturamento e notificacoes.
- A primeira versao deve usar dados administrativos ja existentes no produto sempre que possivel, antes de introduzir novas fontes de informacao.
- Receita exibida no dashboard sera tratada como estimativa operacional, nao como demonstrativo contabil.
- "Melhor dashboard do mercado" foi interpretado como referencia de produto SaaS maduro: clareza financeira estilo Stripe, hierarquia visual forte, poucos indicadores criticos no primeiro olhar, detalhes progressivos e proximas acoes concretas.
- A tela inicial deve continuar sendo uma ferramenta de trabalho, nao uma landing page promocional.
- Comparativos de periodo podem usar janelas operacionais padrao, como hoje, ultimos 7 dias ou ultimos 30 dias, desde que o periodo fique claro para o usuario.
- Graficos e listas devem existir apenas quando ajudam a decidir; quando a informacao for melhor como lista curta ou alerta, a lista curta deve ter prioridade.
