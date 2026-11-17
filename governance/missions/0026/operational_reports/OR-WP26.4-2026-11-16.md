# OR — WP26.4 — Mapa inicial de equivalências e gaps MeshWave × Ethereum/EVM

**Data:** 2026-11-16  
**Executor:** análise manual assistida por ChatGPT, ferramentas gratuitas  
**Estado:** IN PROGRESS — matriz inicial de responsabilidades construída; validação de fronteiras e alternativas pendente  
**Missão:** MISSION_0026  
**Base:** OR-WP26.1, OR-WP26.2, OR-WP26.3 e consulta live ao Supabase MeshWave65

## 1. Objetivo e limite

Comparar o que a MeshWave efetivamente faz hoje com as responsabilidades que podem ser delegadas a Ethereum/EVM ou a componentes maduros do ecossistema. Este OR não escolhe ainda a arquitetura final A–F e não autoriza implementação.

É essencial separar:
- Ethereum como rede pública com consenso, produção de blocos e execução EVM;
- EVM como runtime de execução determinística;
- contratos como regras e estado on-chain;
- clientes, RPCs e indexadores como infraestrutura;
- aplicações MeshWave, ledger econômico, MW-Ex e PoUW como responsabilidades de produto que não desaparecem automaticamente ao adotar Ethereum.

## 2. Baseline técnico MeshWave relevante para a comparação

### 2.1 Cadeia e produção de blocos atuais

A função live public.mw_append_event(p_chain_id, p_event) foi inspecionada diretamente no banco. Ela:

1. valida que o evento seja um objeto JSON e contenha event_id e type;
2. bloqueia a linha de metadata da cadeia com FOR UPDATE;
3. verifica unicidade de event_id;
4. calcula o próximo block_number a partir do latest_block_number;
5. constrói um payload canônico com timestamp, previous_hash e um array contendo o evento;
6. calcula transaction_hash por SHA-256 do evento canônico;
7. calcula block_hash por SHA-256 do payload canônico;
8. grava um bloco e uma transação, com transaction_index=0;
9. atualiza latest_block_number e latest_block_hash.

A função também impede transferências diretas UMS entre MeshWalkers, exceto o crédito de aquisição Genesis autorizado pela regra implementada.

A cadeia live tem 80 blocos e 80 transações: o desenho atual produz um bloco por evento/transação. A serialização pelo lock da metadata e o metadata consensus=single-operator confirmam que a produção é centralizada no operador atual.

### 2.2 Ledger e MW-Ex

- 80 transações de cadeia, 135 lançamentos no ledger de contas; os 80 hashes de transação têm correspondência no ledger.
- 29 transações MW-Ex e 34 lançamentos MW-Ex; todas as transações possuem lançamentos, sem entradas órfãs.
- MWN está habilitado para seleção de compra/venda, mas matching é MANUAL_REVIEW, confirmação fiduciária MANUAL_ADMIN, ordens a mercado desabilitadas e não há ordens/fills live.
- UMS permanece sujeito à regra de não transferência direta entre usuários.
- As carteiras atuais usam identificadores de aplicação mww_..., não endereços Ethereum.

## 3. Matriz inicial de equivalências

| Responsabilidade atual MeshWave | Evidência / maturidade atual | Equivalente no ecossistema Ethereum | O que Ethereum pode assumir | Gap ou trabalho que permanece MeshWave | Classificação preliminar |
|---|---|---|---|---|---|
| Produção, ordenação e encadeamento de blocos | mw_append_event cria um bloco por evento; metadata single-operator | Rede Ethereum, clientes de execução e consenso PoS; em L2, sequenciador e mecanismo de rollup | Produção/ordenação canônica e consenso, se a rede escolhida for a fonte de verdade | Definir L1/L2, finalização, dependências de sequenciador, disponibilidade de dados, reorgs e política de migração | SUBSTITUIR se a decisão for delegar a cadeia canônica |
| Execução de regras e transições de estado | Regras implementadas em funções SQL/RPC e ledger | EVM + contratos Solidity | Executar regras determinísticas e atualizar estado on-chain | Traduzir regras de negócio, testar invariantes, controlar upgrades e lidar com gas/limites EVM | ADOTAR/ADAPTAR |
| Integridade e prova pública de transações | SHA-256 sobre JSON canônico; hash do evento e do payload do bloco | Hashes, receipts, logs, state roots e consenso da rede Ethereum | Fornecer evidência pública de inclusão e estado aceito pela rede | Definir o que será gravado on-chain; logs não substituem automaticamente um ledger contábil nem preservam dados off-chain | ADOTAR |
| Ledger de saldos e lançamentos | mw_account_ledger, 135 linhas para 80 transações; MW-Ex em ledger separado | Storage de contratos, mappings, eventos e indexadores | Manter saldos/estados on-chain com regras determinísticas; emitir eventos auditáveis | Decidir fonte canônica de saldo, privacidade, custo por escrita, reconciliação e projeções SQL | INTEGRAR ou ADAPTAR; não presumir substituição integral do banco |
| UMS e proibição de transferência P2P | Regra implementada em mw_append_event e ledger segregado | Contrato com restrições de transferência e papéis; ERC-20 convencional | Aplicar restrições de transferência se codificadas no contrato | ERC-20 padrão permite transferências e approvals; requer contrato customizado/restrito ou manter UMS fora da cadeia | MANTER PRÓPRIO ou ADAPTAR com controles explícitos |
| MWN como ativo-ponte | Ledger MW-Ex, conversões UMS↔MWN e transferências internas | ERC-20 e bibliotecas OpenZeppelin | Representar MWN como token fungível e aplicar regras on-chain | Definir supply, decimals, mint/burn, custódia, transferências, pausas, permissões e migração de saldos | ADAPTAR; não usar ERC-20 sem configuração econômica aprovada |
| Conversão UMS↔MWN | RPCs MW-Ex criam evento na cadeia MeshWave e lançamentos correspondentes | Contrato de conversão/escrow, se ambos os ativos tiverem representação on-chain; eventos e oráculos para estados off-chain | Garantir transições on-chain entre representações controladas | Preservar proporção e regras econômicas, evitar dupla contabilização e manter trilha de reconciliação | INTEGRAR/ADAPTAR |
| Compra/venda e matching MW-Ex | Funções de ordem, reserva, fill e liquidação; matching manual; sem ordens/fills live | Contratos de exchange/escrow, DEX ou matching off-chain com liquidação on-chain | Custodiar/reservar ativos e liquidar trocas on-chain; contratos podem impor regras | Ethereum não fornece livro de ordens, preço, liquidez, KYC, FIAT ou matching do produto; integração de pagamento continua externa | MANTER/INTEGRAR; não presumir que Ethereum substitua MW-Ex |
| Carteiras e identidade de conta | Identificadores mww_... gerados pela aplicação; autenticação/perfil MeshWalker | Endereços EOA, smart accounts, ERC-4337/EIP-7702, provedores de carteira | Assinatura e autorização criptográfica de transações; recuperação programável com desenho próprio | Mapear contas e custódia, recuperar acesso, associar identidade sem expor dados pessoais, tratar gas e chaves | ADAPTAR |
| PoUW e evidências de contribuição | Conceito amplo; motor de validação não comprovado como implementado | Contratos de registro/atestações, eventos, papéis e distribuição de recompensas | Registrar atestações verificadas e executar distribuição determinística | Medição de CPU/storage/rede, utilidade, verificação, antifraude e oráculos continuam off-chain | MANTER PRÓPRIO + INTEGRAR |
| Dados pessoais, perfis, documentos e arquivos | Supabase e serviços de aplicação | Armazenamento off-chain; hashes/commitments on-chain quando necessários | Registrar prova de integridade ou referência sem publicar o conteúdo | Privacidade, LGPD, retenção, exclusão, controle de acesso e armazenamento continuam sob responsabilidade MeshWave | MANTER FORA DA CADEIA |
| RPC, indexação e leitura de eventos | Consultas e tabelas operacionais Supabase; inventário de indexação ainda parcial | Nós Ethereum, RPC, indexadores e explorers | Disponibilizar acesso à rede e histórico conforme tipo de nó/serviço | Selecionar fornecedor ou operar nó, indexar eventos, monitorar disponibilidade e reconciliar projeções | ADOTAR/INTEGRAR |
| Governança e permissões administrativas | Funções SECURITY DEFINER, verificações admin e controles em banco | OpenZeppelin AccessControl, multisig, timelock e governança on-chain | Aplicar papéis, atrasos e aprovações sobre operações de contrato | Definir papéis, rotação/recuperação de chaves, resposta a incidentes e governança humana | ADAPTAR |
| Backup/replicação da cadeia | Hoje depende da infraestrutura do banco/operador | Réplicas de nós Ethereum e mecanismos de archive/indexing conforme necessidade | Replicar o estado e dados da rede escolhida | Não replica automaticamente dados privados ou arquivos MeshWave fora da cadeia | Não criar replicação MeshWalker paralela sem necessidade concreta |

## 4. Gaps principais identificados

### 4.1 A migração não é uma simples troca de banco

A função atual combina validação de regra de negócio, geração de hash, gravação de bloco, gravação da transação e atualização do ponteiro da cadeia dentro de uma transação SQL. Em Ethereum, essas responsabilidades se distribuem entre:
- protocolo da rede e clientes (blocos, consenso, finalização);
- contrato (regras e estado on-chain);
- indexador/serviço de aplicação (projeções e consultas);
- componentes off-chain (identidade, arquivos, evidências, FIAT e interfaces).

É necessário redesenhar a fronteira de confiança e a fonte canônica dos saldos; não basta portar a função SQL para Solidity.

### 4.2 Um evento de negócio não equivale a um bloco Ethereum

A MeshWave atual grava um bloco por evento e apenas uma transação por bloco. Ethereum agrupa transações em blocos conforme as regras do protocolo e limites de execução. O evento MeshWave passaria a ser, em geral, uma chamada de contrato e/ou um log emitido dentro de uma transação Ethereum, não um bloco próprio.

### 4.3 Ethereum não substitui o domínio econômico MeshWave

Ethereum oferece execução, consenso e infraestrutura de estado. Não decide:
- quem é elegível para receber UMS;
- quando uma contribuição PoUW é útil e verificável;
- quais ativos MW-Ex pode negociar;
- qual é a proporção UMS↔MWN;
- como se confirma PIX/Multibanco;
- como ocorre matching, liquidez, atendimento, contestação ou governança do produto.

Essas regras precisam continuar implementadas e governadas pela MeshWave, ainda que algumas sejam aplicadas por contratos.

### 4.4 Privacidade e dados fora da cadeia

Colocar saldos, identidades ou eventos detalhados em rede pública pode expor relações e padrões de comportamento. Dados pessoais, documentos, arquivos, provas extensas e informações comerciais devem permanecer off-chain, salvo decisão fundamentada e minimização. Hashes/commitments podem provar integridade sem publicar o conteúdo, mas não resolvem armazenamento, disponibilidade ou exclusão.

### 4.5 Segurança de contratos e custódia

A adoção transfere parte do risco de integridade da infraestrutura própria para o protocolo escolhido, mas introduz riscos de bugs de contrato, chaves, upgrades, bridges, RPC, sequenciador e governança. Bibliotecas maduras reduzem código proprietário, não eliminam auditoria nem controles operacionais.

## 5. Conclusões provisórias

1. A responsabilidade mais diretamente substituível é a produção/ordenação/consenso da cadeia atual de operador único, se a MeshWave optar por usar Ethereum ou uma L2 como fonte canônica.
2. EVM/Solidity e bibliotecas maduras podem substituir parte da lógica proprietária de execução, mas apenas depois de separar regras econômicas e definir o estado que realmente precisa estar on-chain.
3. UMS não deve ser convertido diretamente em ERC-20 livremente transferível. A regra de não transferência P2P é invariável do modelo atual.
4. MWN é candidato a representação ERC-20, mas somente com supply, permissões, transferibilidade, custódia e gateway MW-Ex formalmente definidos.
5. MW-Ex, PoUW, FIAT, identidade e dados privados não são substituídos automaticamente por Ethereum. São camadas de produto que podem integrar contratos.
6. Supabase pode continuar como banco operacional, projeção/indexador e armazenamento de dados privados, mesmo se a cadeia canônica migrar. Nesse desenho, precisa ficar explícito que o banco não é a fonte de verdade para os fatos on-chain.
7. A ideia de replicação MeshWalker não é necessária para replicar a cadeia Ethereum. Pode ter utilidade futura para conteúdo off-chain, mas só deve ser reavaliada diante de requisito concreto.

Essas conclusões são preliminares e não escolhem entre Ethereum Mainnet, L2, appchain EVM ou adoção seletiva de tooling.

## 6. Questões que precisam ser resolvidas antes do WP26.5

1. O que exatamente deve se tornar canônico on-chain: somente MWN, ambos MWN e UMS, ou também eventos de conversão e recompensas?
2. UMS deve continuar exclusivamente como unidade interna contabilizada off-chain, ou existe requisito explícito de representação on-chain com transferências bloqueadas?
3. MWN precisa ser livremente transferível em uma rede pública, ou apenas negociável por meio da MW-Ex?
4. Qual nível de transparência pública é aceitável para saldos e operações?
5. A MeshWave pretende delegar a segurança à Ethereum Mainnet/L2, ou manter governança de validadores própria?
6. Qual volume esperado de transações e custo máximo aceitável por operação?
7. Quais dados e serviços precisam permanecer operacionais mesmo se RPC, sequenciador ou rede externa estiverem indisponíveis?

## 7. Próxima etapa

Completar as evidências de repositórios/deployments e responder às questões de fronteira que mudam materialmente as alternativas. Depois, WP26.5 poderá comparar as arquiteturas A–F sem antecipar a escolha.

## 8. Integridade

- Consulta ao Supabase MeshWave65: read-only.
- Inspeção de funções e configurações: read-only.
- Busca GitHub por pragma Solidity nos repositórios meshwave-blockchain, newsite e Foundation_MeshWave: nenhum resultado retornado; isso não prova ausência em todo o ecossistema.
- Nenhum código, contrato, saldo, carteira, chave, configuração ou dado foi alterado.
- Nenhuma POC, transação, migração ou deploy foi executado.
