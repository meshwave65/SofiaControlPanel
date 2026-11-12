# Proposta — Histórico interno de preço da MWN (MISSION_0021)

**Estado:** PROPOSTA PARA AVALIAÇÃO — não aprovada como arquitetura nem autorizada para implementação  
**Missão:** MISSION_0021  
**Data:** 2026-11-12  
**Origem:** sugestão apresentada pelo responsável durante a interação registrada em OR-20261112-0056

## 1. Problema e objetivo

A MWN não possui cotação pública externa: não está listada em exchange externa e sua negociação ocorre exclusivamente dentro da MW-Ex. Isso não impede que seu preço de referência interno varie ao longo do tempo em consequência de eventos do próprio mercado.

O objetivo é preservar a evolução temporal do preço interno da MWN, permitindo reconstruir a série histórica, apresentar gráficos e calcular fechamentos diários sem atribuir à MWN uma cotação pública inexistente.

O valor atualmente referido pelo responsável como 0,0021605 precisa ser reconciliado com a tabela e coluna efetivamente existentes, sua unidade/moeda, precisão, regra de atualização e autoridade de alteração. Este documento não presume esses detalhes.

## 2. Proposta recebida

O responsável sugeriu:
- criar uma tabela específica para registrar alterações de preço;
- produzir um registro a cada evento que efetivamente altere o preço na fonte atualmente utilizada;
- incluir timestamp para ordenar e situar cada alteração;
- usar o histórico para compor gráficos de evolução;
- começar com acompanhamento por evento e possível evolução futura para fechamentos diários e frequências menores, inclusive monitoramento em segundos, apenas se a atividade real justificar.

A sugestão não constitui decisão arquitetural nem autorização para alterar o banco.

## 3. Avaliação e recomendação preliminar

Recomenda-se avaliar primeiro um **ledger append-only de eventos de preço** como fonte histórica primária, em vez de gravar apenas uma linha diária.

Justificativa:
- preserva cada mudança efetiva, inclusive várias mudanças no mesmo dia;
- mantém a ordem temporal e a proveniência de cada alteração;
- permite reconstruir o último preço conhecido em qualquer instante;
- permite derivar fechamentos diários e séries de granularidade maior sem perder a história original;
- não exige adotar hoje monitoramento contínuo ou por segundos.

A tabela de eventos seria a fonte histórica. O fechamento diário pode inicialmente ser calculado por consulta sobre os eventos, sem tabela física adicional. Uma tabela/materialização de candles diários só deve ser adotada se medições de volume, latência ou custo demonstrarem necessidade. Isso evita duas fontes concorrentes e inconsistência entre evento e fechamento.

Essa é uma recomendação para discussão, não uma decisão aprovada.

## 4. Semântica temporal proposta

Distinguir explicitamente:
- **evento de alteração:** mudança efetiva do preço no instante em que passa a valer;
- **observação:** leitura do preço vigente em determinado instante, mesmo que não tenha mudado;
- **fechamento diário:** último preço efetivo conhecido até o limite do dia, segundo um fuso horário definido;
- **ausência de evento:** não significa preço zero nem alteração; o fechamento pode carregar o último preço conhecido, identificado como carregado/sem nova alteração.

Para a primeira versão, recomenda-se registrar somente alterações efetivas. Não criar um evento de alteração artificial em dias sem mudança.

O fuso horário para fechamento diário ainda precisa ser escolhido (por exemplo, UTC ou America/Sao_Paulo). Os timestamps dos eventos devem preservar instante inequívoco, preferencialmente `timestamptz`, e a apresentação deve converter para o fuso definido pelo produto.

## 5. Metadados candidatos para avaliação

Os campos abaixo são candidatos, não um schema aprovado:
- identificador único do evento;
- ativo/símbolo (MWN);
- preço anterior e preço novo, com tipo decimal de precisão adequada;
- unidade e moeda de denominação do preço, a confirmar na fonte atual;
- instante de vigência (`effective_at`);
- instante de registro no banco (`recorded_at`);
- tipo/origem do evento (por exemplo, alteração administrativa aprovada, regra de mercado, execução/resultado de mercado — somente categorias que existam de fato);
- identificador do evento de origem ou operação correlacionada;
- ator responsável (usuário, serviço ou processo), quando aplicável;
- justificativa/motivo e referência de aprovação, quando aplicável;
- metadados de proveniência e versão da regra/parâmetro que determinou o preço, se aplicável.

Não presumir que todo preço tenha contraparte, ordem executada, volume ou liquidez. Esses campos só devem existir se o modelo real de formação de preço os sustentar.

## 6. Integridade e captura

Recomendação preliminar:
- evento deve ser append-only; correções não apagam nem sobrescrevem o original, mas geram evento corretivo referenciado;
- a mudança da fonte canônica de preço e a gravação do evento devem ocorrer atomicamente, ou por mecanismo transacional equivalente que impeça mudança sem histórico;
- evitar trigger, job ou listener duplicado antes de inspecionar o fluxo atual que atualiza o preço;
- definir chave de idempotência/correlação para impedir eventos duplicados em retries;
- controlar acesso de escrita; consumidores da UI devem ter leitura limitada e não poder alterar histórico;
- definir RLS/GRANT conforme exposição real do schema, sem expor escrita ao cliente;
- validar preço positivo, precisão, moeda/unidade e coerência entre preço anterior e preço novo;
- registrar timestamps em UTC como instantes; definir separadamente o fuso do fechamento.

A escolha entre trigger, função transacional ou gravação explícita no serviço que altera o preço deve ser feita somente após localizar a fonte real e entender como ela é atualizada. Não é recomendável decidir isso por antecipação.

## 7. Fechamento diário e gráficos

Para cada dia, o fechamento é o último preço efetivo conhecido no limite do dia. Se não houve evento naquele dia, o valor pode ser o último preço anterior, mas a série deve sinalizar que não houve alteração/evento no dia e qual a idade do último evento.

Para gráfico por evento, usar todos os eventos ordenados por `effective_at` e identificador de desempate. Para gráfico diário, derivar um ponto por dia segundo o fuso e a regra de fechamento aprovados.

A interface deve identificar claramente:
- **preço interno de referência MWN** (não cotação pública);
- origem interna e momento da última alteração;
- intervalo/granularidade do gráfico;
- dias sem alteração e dados carregados do último evento, quando aplicável.

Não apresentar a série interna como preço de mercado externo, cotação pública, preço executável garantido ou prova de liquidez.

## 8. Evolução de frequência

A frequência deve acompanhar a realidade do mercado e a capacidade operacional, não uma meta técnica antecipada:
1. fase inicial: registrar eventos efetivos de alteração;
2. quando houver necessidade analítica: derivar fechamento diário;
3. com crescimento da atividade: avaliar snapshots/candles em intervalos menores;
4. somente se houver volume, latência e benefício comprovados: avaliar monitoramento online em segundos.

A evolução de granularidade não deve exigir descartar ou reescrever eventos históricos. O ledger de eventos continua sendo a trilha primária, salvo decisão futura fundamentada.

## 9. Alternativas consideradas

| Alternativa | Avaliação preliminar |
|---|---|
| Apenas tabela de fechamento diário | Simples, mas perde múltiplas alterações intradiárias e não atende integralmente ao histórico por evento. Não recomendada como única fonte se eventos são relevantes. |
| Ledger append-only de eventos + fechamento diário derivado | Melhor equilíbrio inicial entre auditabilidade, simplicidade e evolução. Recomendação preliminar. |
| Ledger de eventos + tabela física de candles diários desde o início | Pode acelerar consultas, mas cria duplicação e exige mecanismo de consistência. Adiar até haver necessidade demonstrada. |
| Polling contínuo por segundos | Prematuro sem atividade e requisitos de latência que justifiquem custo e complexidade. Não adotar nesta fase. |

## 10. Pendências que bloqueiam uma decisão de schema

1. Identificar no Supabase a tabela/coluna que atualmente contém o preço 0,0021605 e confirmar o valor atual.
2. Confirmar a unidade/moeda desse preço e seu significado econômico (preço de referência, preço definido por parâmetro, último preço de execução ou outro).
3. Identificar todos os caminhos que podem alterar esse valor: UI/admin, RPC, Edge Function, backend, job ou operação de mercado.
4. Confirmar quem/qual processo tem autoridade para alterá-lo e quais aprovações são exigidas.
5. Definir o fuso horário de fechamento diário.
6. Verificar volume esperado de eventos, consultas e retenção.
7. Verificar schema, RLS, grants, políticas e exposição da tabela antes de qualquer DDL.

A tentativa de leitura do projeto Supabase `mwn` nesta interação falhou com erro de autenticação do usuário read-only (`28P01`). Portanto, a tabela e a coluna do preço não foram verificadas. Nenhuma alteração foi feita no banco.

## 11. Estado de decisão nesta interação

- **Recebido:** sugestão de histórico de preço MWN por evento, com timestamp e evolução potencial de frequência.
- **Recomendado para avaliação:** ledger append-only de eventos como histórico primário; fechamento diário derivado; sem polling por segundos nesta fase.
- **Não decidido:** nome da tabela, colunas finais, mecanismo de captura, fuso de fechamento, retenção, RLS, grants e implementação.
- **Não adotado/rejeitado nesta fase:** tabela diária como única fonte histórica (perde eventos intradiários); monitoramento contínuo por segundos (prematuro sem evidência de necessidade).
- **Não executado:** DDL, migration, trigger, RPC, alteração de preço, gravação de dados ou deploy.
- **Próximo gate:** recuperar acesso de leitura ao projeto Supabase correto e inspecionar schema e fluxo real de atualização antes de apresentar uma proposta final de implementação.

## 12. Relação com a governança da missão

As declarações do responsável devem ser tratadas como propostas sujeitas a análise, salvo quando ele explicitamente as aprovar como decisão. O agente deve:
1. identificar o problema e a intenção;
2. avaliar a proposta e suas premissas;
3. apresentar alternativas, benefícios, riscos e recomendação;
4. distinguir o que foi aceito, rejeitado, adiado ou permanece em aberto;
5. registrar a justificativa e a evidência no Operational Report;
6. atualizar os artefatos da missão sem transformar automaticamente uma sugestão em arquitetura aprovada;
7. não executar mudanças de banco, regras econômicas, transações ou deploys sujeitos a gate sem aprovação específica.

Cada interação de trabalho relevante na MISSION_0021 deve gerar um OR auditável, inclusive quando nenhuma mudança for implementada. O OR deve registrar decisões tomadas e não tomadas, motivos, evidências, limitações e próximos gates. Correções de entendimento devem ser preservadas como histórico, não apagadas por reescrita silenciosa.
