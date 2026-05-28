# Feature Specification: Faturamento Operacional

**Feature Branch**: `006-faturamento-operacional`
**Created**: 2026-05-28
**Status**: Draft
**Input**: User description: "bora criar uma tela de faturamento melhor, com detalhes reais e coisas uteis e nao vazias, pegue referencia do melhor do mercado e tudo deve ser condizente, exemplo, se alguem cancelar uma assinatura os dados devem ser alterados tambem e nao se manter, o mesmo vale pra assinatura novas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver receita real e assinantes atuais (Priority: P1)

Como administrador, quero abrir a tela de faturamento e enxergar a receita recorrente estimada, assinantes ativos, novas assinaturas, cancelamentos e distribuicao por plano com base nos dados atuais da operacao, para entender rapidamente se o faturamento esta crescendo, caindo ou parado.

**Why this priority**: Sem numeros confiaveis e atualizados, a tela vira apenas visual e pode induzir decisoes erradas sobre receita e base ativa.

**Independent Test**: Pode ser testado cadastrando ou sincronizando usuarios com assinaturas ativas, trials e canceladas; ao abrir a tela, os indicadores devem refletir a base atual e cada numero principal deve ter uma explicacao clara.

**Acceptance Scenarios**:

1. **Given** uma base com assinaturas ativas pagas, trials e assinaturas canceladas, **When** o administrador abre faturamento, **Then** a receita recorrente estimada considera apenas assinaturas que devem contar como receita atual e separa assinantes ativos de trials quando isso mudar a interpretacao.
2. **Given** uma assinatura cancelada, **When** os indicadores forem exibidos, **Then** essa assinatura nao permanece como assinante ativo pago nem continua somando no MRR estimado.
3. **Given** uma nova assinatura ativa, **When** a tela for carregada novamente, **Then** os totais de assinantes, MRR estimado, plano correspondente e eventos recentes passam a incluir essa nova assinatura.

---

### User Story 2 - Entender por que a receita mudou (Priority: P2)

Como administrador, quero ver uma explicacao das mudancas recentes de faturamento, separando novas assinaturas, renovacoes, cancelamentos, trocas de plano e vencimentos proximos, para saber quais clientes ou planos estao puxando crescimento ou perda.

**Why this priority**: Ferramentas maduras de faturamento nao mostram apenas totais; elas permitem auditar o que mudou e chegar nos clientes ou eventos que explicam a variacao.

**Independent Test**: Pode ser testado criando eventos recentes de assinatura nova, cancelamento e troca de plano; a tela deve exibir uma linha do tempo ou lista auditavel com impacto, usuario relacionado, plano e data.

**Acceptance Scenarios**:

1. **Given** uma nova assinatura criada nos ultimos dias, **When** o administrador consulta a atividade recente, **Then** o evento aparece com usuario, plano, data e indicacao de impacto positivo.
2. **Given** um cancelamento recente, **When** o administrador consulta a atividade recente ou fila operacional, **Then** o evento aparece com usuario, plano, data e indicacao de impacto negativo.
3. **Given** uma troca de plano que substitui uma assinatura antiga por uma nova, **When** a tela explica a mudanca, **Then** a leitura nao deve contar o cancelamento tecnico como perda real se a nova assinatura substituiu a anterior no mesmo fluxo.

---

### User Story 3 - Agir sobre riscos e oportunidades (Priority: P3)

Como administrador, quero que a tela destaque renovacoes proximas, clientes sem plano, cancelamentos recentes e planos com maior impacto na receita, para priorizar acompanhamento comercial e suporte sem precisar garimpar varias telas.

**Why this priority**: Depois de confiar nos numeros, o usuario precisa de uma fila curta de acoes uteis, nao de blocos vazios ou informativos genericos.

**Independent Test**: Pode ser testado com assinaturas vencendo nos proximos dias, usuarios ativos sem plano e cancelamentos recentes; a tela deve apresentar acoes ou links contextuais para os registros afetados.

**Acceptance Scenarios**:

1. **Given** assinaturas ativas com vencimento proximo, **When** a tela for aberta, **Then** elas aparecem em uma area de renovacoes ou riscos com prioridade maior para vencimentos mais proximos.
2. **Given** usuarios ativos sem assinatura comercialmente valida, **When** a fila operacional for exibida, **Then** esses usuarios aparecem como oportunidade de regularizacao ou venda.
3. **Given** nao existem pendencias criticas, **When** a tela for exibida, **Then** ela mostra um estado util informando que a operacao esta em dia, sem ocupar a interface com cards vazios.

---

### User Story 4 - Filtrar e conferir detalhes por periodo e plano (Priority: P4)

Como administrador, quero filtrar a leitura por periodo recente e por plano, e abrir os detalhes por usuario ou plano quando um numero chamar atencao, para conferir a origem dos indicadores sem perder contexto.

**Why this priority**: Filtros e drill-down reduzem a chance de conclusoes erradas quando a base cresce ou quando um plano especifico concentra receita ou cancelamentos.

**Independent Test**: Pode ser testado alterando o periodo de analise e selecionando um plano; os totais, listas e eventos devem atualizar para refletir apenas o recorte escolhido.

**Acceptance Scenarios**:

1. **Given** uma base com varios planos, **When** o administrador filtra por um plano, **Then** receita, assinantes, eventos e lista de riscos mostram apenas dados relacionados ao plano escolhido.
2. **Given** um periodo selecionado, **When** o administrador muda o periodo, **Then** novas assinaturas, cancelamentos e variacoes recentes sao recalculados para o novo intervalo.
3. **Given** um indicador agregado, **When** o administrador acessa seus detalhes, **Then** a tela mostra os usuarios, planos ou eventos que compoem aquele numero.

### Edge Cases

- Se nao houver assinaturas ativas, a tela deve mostrar receita recorrente estimada como zero e orientar o proximo passo, sem apresentar graficos ou percentuais enganosos.
- Se houver usuarios ativos sem assinatura, eles devem aparecer como oportunidade ou pendencia, mas nao podem ser contabilizados como assinantes pagos.
- Se uma assinatura estiver em trial, ela pode contar como base comercial ativa, mas deve ficar separada de receita paga quando nao houver valor recorrente confirmado.
- Se uma assinatura cancelada ainda tiver historico de pagamento, ela deve permanecer nos eventos e historico, mas sair dos totais atuais de assinantes pagos e MRR.
- Se uma troca de plano gerar cancelamento da assinatura anterior e criacao de outra, a tela deve evitar duplicar churn quando os eventos representarem uma substituicao no mesmo fluxo.
- Se dados essenciais de plano ou usuario estiverem incompletos, a tela deve informar a lacuna no item afetado e manter os demais indicadores confiaveis.
- Se a base estiver vazia, a tela deve mostrar estados vazios acionaveis e nao blocos visuais sem conteudo real.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela de faturamento MUST apresentar um resumo executivo com MRR estimado, receita anualizada estimada, assinantes pagos ativos, trials, novas assinaturas no periodo, cancelamentos no periodo e renovacoes proximas.
- **FR-002**: O MRR estimado MUST ser calculado apenas a partir de assinaturas pagas que estejam ativas no momento da leitura, normalizando planos com duracao diferente para uma base mensal.
- **FR-003**: Assinaturas canceladas, vencidas ou sem valor recorrente confirmado MUST NOT continuar somando como receita atual nem como assinantes pagos ativos.
- **FR-004**: Novas assinaturas ativas MUST atualizar totais, distribuicao por plano, atividade recente e listas de detalhe assim que a tela carregar dados atuais.
- **FR-005**: Cancelamentos MUST reduzir os totais atuais correspondentes e aparecer como evento recente com usuario, plano, data e impacto de perda quando forem cancelamentos reais.
- **FR-006**: Trocas de plano MUST ser representadas como mudanca de receita entre planos, evitando tratar cancelamentos tecnicos de substituicao como churn real.
- **FR-007**: A tela MUST exibir distribuicao por plano com quantidade de assinantes, receita estimada, participacao no MRR e indicacao de planos sem receita atual quando aplicavel.
- **FR-008**: A tela MUST oferecer uma lista auditavel de eventos recentes de faturamento, incluindo assinatura criada, renovacao, cancelamento e troca de plano quando esses eventos existirem.
- **FR-009**: A tela MUST permitir que o administrador veja os registros que compoem cada indicador principal, com caminho claro para o usuario, plano ou assinatura relacionado.
- **FR-010**: A tela MUST destacar uma fila curta de acoes com renovacoes proximas, usuarios ativos sem plano, cancelamentos recentes e inconsistencias que podem afetar faturamento.
- **FR-011**: A tela MUST permitir recorte por periodo recente padrao e por plano, mantendo os totais e listas coerentes com o recorte selecionado.
- **FR-012**: A tela MUST mostrar quando os dados foram atualizados ou gerados, para o administrador entender se a leitura representa a operacao atual.
- **FR-013**: Estados vazios MUST ser informativos e acionaveis, explicando por que nao ha dados e qual proxima acao faz sentido.
- **FR-014**: A tela MUST evitar percentuais, tendencias ou alertas quando a base numerica for insuficiente para uma leitura confiavel.
- **FR-015**: Erros parciais de dados MUST preservar o que pode ser exibido com confianca e sinalizar claramente quais secoes nao puderam ser calculadas.
- **FR-016**: Os nomes, labels e descricoes MUST usar linguagem operacional clara para administradores brasileiros, com valores monetarios em reais.

### Key Entities *(include if feature involves data)*

- **Assinatura**: Representa o vinculo comercial de um usuario com um plano, incluindo status, periodo de vigencia, cancelamento, renovacao e relacao com o plano.
- **Plano**: Representa a oferta comercial vendida, com nome, codigo, preco, duracao e estado ativo ou inativo.
- **Usuario/Cliente**: Representa a pessoa ou conta administrada que pode ter uma ou mais assinaturas ao longo do tempo.
- **Evento de Faturamento**: Representa uma mudanca relevante para a leitura financeira, como assinatura criada, renovada, cancelada ou alterada.
- **Indicador de Faturamento**: Representa um numero calculado para decisao operacional, como MRR estimado, assinantes ativos, churn recente, novas assinaturas e receita por plano.
- **Pendencia Operacional**: Representa um item que exige atencao do administrador, como renovacao proxima, cancelamento recente, usuario ativo sem plano ou dado inconsistente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores conseguem identificar MRR estimado, assinantes pagos ativos, cancelamentos recentes e novas assinaturas em ate 30 segundos apos abrir a tela.
- **SC-002**: Em testes com cancelamento de assinatura, os totais de MRR e assinantes pagos deixam de contar a assinatura cancelada em 100% dos casos validos apos recarregar dados atuais.
- **SC-003**: Em testes com nova assinatura ativa, os totais de MRR, assinantes pagos e distribuicao do plano incluem a nova assinatura em 100% dos casos validos apos recarregar dados atuais.
- **SC-004**: Pelo menos 90% dos indicadores principais exibidos possuem acesso ou explicacao dos registros que compoem o numero.
- **SC-005**: Estados vazios nao exibem graficos ou cards sem conteudo real; 100% deles apresentam motivo e proxima acao apropriada.
- **SC-006**: A tela permanece compreensivel sem rolagem horizontal em larguras comuns de desktop, tablet e celular.
- **SC-007**: Administradores conseguem localizar um cliente associado a um cancelamento, renovacao ou nova assinatura em ate 2 interacoes a partir da tela de faturamento.

## Assumptions

- A tela usa a base administrativa existente de usuarios, planos, assinaturas e eventos relacionados como fonte de verdade.
- A feature nao cria uma ferramenta contábil fechada; os valores sao indicadores operacionais estimados para gestao, nao demonstrativos financeiros oficiais.
- Receita recorrente estimada considera planos recorrentes conhecidos; impostos, estornos, taxas externas e pagamentos avulsos ficam fora do escopo desta versao se nao estiverem disponiveis na base atual.
- A referencia de mercado adotada para a especificacao e a combinacao de praticas comuns em produtos maduros de billing analytics: MRR, churn, novas assinaturas, drill-down, filtros por plano/periodo e explicacao de eventos.
- O periodo recente padrao pode iniciar em 30 dias para metricas de novas assinaturas e cancelamentos, com uma janela menor para renovacoes proximas quando isso for mais util operacionalmente.
- Apenas administradores e atendentes autorizados devem acessar a tela, seguindo as permissoes ja existentes do painel.
