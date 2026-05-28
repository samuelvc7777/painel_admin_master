# Research: Faturamento Operacional

## Decisao 1: criar contrato dedicado de faturamento administrativo

**Decision**: Criar uma leitura de faturamento separada do dashboard operacional, com contrato proprio para resumo, distribuicao por plano, eventos recentes, fila de acoes, filtros e estados de secao.

**Rationale**: A tela de faturamento precisa responder perguntas financeiras especificas que o dashboard inicial nao cobre com profundidade: o que esta somando no MRR, o que saiu por cancelamento, quais planos puxam receita e quais eventos explicam mudancas. Reaproveitar o contrato de dashboard atual manteria a tela presa a campos genericos.

**Alternatives considered**:

- Reaproveitar `/admin/dashboard`: rejeitado porque mistura saude operacional geral com leitura financeira detalhada.
- Calcular tudo na tela com `/user`: rejeitado porque espalha regra critica no cliente e aumenta risco de divergencia entre telas.

## Decisao 2: calcular indicadores no servidor a partir da fonte atual

**Decision**: Centralizar o calculo em `src/lib/api/server.ts`, usando usuarios hidratados com assinaturas e planos, eventos de notificacao e eventos da Play Store ja disponiveis.

**Rationale**: Cancelamentos, novas assinaturas e trocas de plano precisam alterar totais de forma consistente. Calculo server-side reduz duplicacao, preserva autorizacao administrativa e permite que diferentes componentes consumam a mesma verdade.

**Alternatives considered**:

- Somar valores diretamente em componentes React: rejeitado por duplicar regra de negocio e dificultar auditoria.
- Criar nova tabela agregada: rejeitado para esta fase porque os dados existentes sao suficientes para uma leitura operacional estimada.

## Decisao 3: MRR atual exclui canceladas, vencidas e trials sem receita paga

**Decision**: O MRR estimado deve considerar assinaturas pagas ativas no momento da leitura, normalizando o valor do plano pela duracao mensal equivalente. Trials podem contar como base comercial ativa, mas ficam separados de receita paga.

**Rationale**: A spec exige que cancelamento e novas assinaturas mudem os numeros imediatamente. Produtos maduros de billing analytics tratam MRR como receita recorrente atual, excluindo cancelamentos, planos gratuitos/trials sem receita e itens nao recorrentes quando nao ha dados confiaveis.

**Alternatives considered**:

- Contar trials no MRR: rejeitado porque inflaria receita nao confirmada.
- Contar historico cancelado no MRR atual: rejeitado porque contradiz o requisito central da feature.
- Exibir apenas valor bruto do plano sem normalizacao: rejeitado porque planos de duracoes diferentes ficariam incomparaveis.

## Decisao 4: trocas de plano precisam ser classificadas como substituicao

**Decision**: Quando uma assinatura e cancelada e outra e criada para o mesmo usuario em janela curta de substituicao, a leitura deve tratar como troca de plano, nao como churn real duplicado.

**Rationale**: O codigo atual ja possui heuristica para ignorar cancelamento de substituicao em notificacoes. A tela de faturamento deve aplicar a mesma ideia para nao transformar upgrade/downgrade em perda falsa.

**Alternatives considered**:

- Tratar todo `canceledAt` como churn: rejeitado porque troca de plano existente geraria falso negativo.
- Ignorar todos os cancelamentos de usuarios que possuem assinatura ativa: rejeitado porque pode esconder cancelamentos reais seguidos de reativacao posterior.

## Decisao 5: a UI deve ser operacional, densa e acionavel

**Decision**: A tela deve priorizar resumo compacto, filtros, breakdown por plano, eventos recentes e fila de acoes, sem hero marketing e sem cards decorativos vazios.

**Rationale**: O usuario administrativo precisa escanear, comparar e agir. A feature pede coisas uteis e reais, entao estados vazios devem explicar a ausencia de dados e direcionar para usuarios, planos ou registros relacionados.

**Alternatives considered**:

- Hero visual grande: rejeitado porque ocupa espaco de trabalho e nao ajuda a operar faturamento.
- Graficos vazios ou placeholders: rejeitado pela propria premissa da feature.

## Decisao 6: filtros iniciais por periodo e plano

**Decision**: Suportar filtros por periodo recente e plano, com periodo padrao operacional e opcao para todos os planos.

**Rationale**: A spec exige recorte por periodo e plano. Esses filtros resolvem a maior parte das perguntas de gestao sem transformar a tela em BI complexo.

**Alternatives considered**:

- Filtros por muitos segmentos: rejeitado para manter a primeira versao focada.
- Sem filtros: rejeitado porque dificulta explicar por que um numero mudou.
