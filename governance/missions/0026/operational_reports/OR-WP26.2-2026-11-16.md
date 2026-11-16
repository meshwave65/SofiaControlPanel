# OR — WP26.2 — Catálogo de tecnologias Ethereum/EVM

**Data:** 2026-11-16  
**Executor:** análise manual assistida por ChatGPT, usando fontes públicas gratuitas  
**Estado:** DONE — catálogo técnico inicial concluído  
**Missão:** MISSION_0026

## 1. Escopo executado

Pesquisa de documentação primária e repositórios oficiais para identificar componentes maduros reutilizáveis, seus limites e sua pertinência à MeshWave. Não houve instalação, execução de POC, deploy, transação ou contratação.

## 2. Catálogo de componentes

| Componente | Função | Reutilização potencial | Limite relevante para MeshWave |
|---|---|---|---|
| EVM | Execução determinística de bytecode/contratos | Runtime para regras programáveis e estado on-chain | Não fornece, isoladamente, consenso, rede P2P, validadores ou finalização |
| Solidity | Linguagem de contratos EVM | Evita criar linguagem e compilador próprios | Exige revisão, testes, auditoria e controle rigoroso de versões |
| ERC-20 | Interface de token fungível | Candidato natural para MWN se a representação on-chain for aprovada | Transferibilidade padrão conflita com UMS segregada e não transferível |
| ERC-721 / ERC-1155 | Ativos únicos / multiativos | Somente se surgirem casos de uso de ativos digitais correspondentes | Não são necessários para o ledger financeiro atual |
| OpenZeppelin Contracts | Implementações reutilizáveis de tokens, permissões, governança e utilitários | Preferir bibliotecas maduras a contratos proprietários equivalentes | Não elimina necessidade de configuração, revisão e auditoria do protocolo |
| AccessControl / TimelockController | Papéis, permissões e atraso de operações administrativas | Controle de mint, pausa, upgrade e operações críticas | Papéis mal definidos ou chaves comprometidas continuam sendo risco |
| Hardhat 3 / Foundry | Compilação, testes, debugging, fuzzing e scripts | Toolchain padrão caso contratos Solidity sejam aprovados | Ferramentas não substituem auditoria nem segurança operacional |
| viem | Cliente TypeScript para JSON-RPC, ABI, contratos e carteiras | Integração com frontend React/Vite e serviços Node | Depende de RPC e de uma rede-alvo definida |
| revm | Implementação EVM em Rust | Possível componente de execução em uma cadeia própria Rust | Não entrega consenso, rede, armazenamento de estado ou governança |
| Account Abstraction (ERC-4337 / EIP-7702) | Smart accounts e validação programável de transações | UX de carteira, recuperação, batching e patrocínio de gas | Aumenta a superfície de ataque e não resolve custódia/governança por si só |
| Ethereum L2 / rollups | Execução em L2 com liquidação/dados associados à L1 | Reduz custo de transações mantendo vínculo com Ethereum | Segurança depende de provas, disponibilidade de dados, sequenciador, upgrades e bridges |
| Hyperledger Besu | Cliente EVM para redes públicas e permissionadas | Candidato a rede EVM permissionada se houver requisito de appchain | Rede permissionada continua dependendo do conjunto de operadores/consenso configurado |
| Cosmos SDK / CometBFT | Framework modular de cadeia própria e consenso BFT | Alternativa para soberania de cadeia e módulos customizados | Exige operar validadores, governança e infraestrutura; não é substituto simples do stack EVM |

## 3. Constatações técnicas

### 3.1 EVM não é consenso

A EVM executa transições de estado de forma determinística: dado um estado válido e um conjunto de transações válidas, produz um novo estado. Em Ethereum, a arquitetura de nó separa:
- cliente de execução: transações, EVM e estado;
- cliente de consenso: fork choice e consenso PoS;
- validador: participação na segurança/produção de blocos, quando habilitado.

Logo, incorporar uma EVM à MeshWave não cria automaticamente uma blockchain distribuída. Seria necessário adotar também uma arquitetura de consenso/rede ou delegar essa responsabilidade a uma rede existente.

### 3.2 Linguagem, bibliotecas e padrões

- A página oficial da Solidity anunciou a versão liberada 0.8.38 em 2026-10-22. A documentação `latest` pode apontar para uma versão de desenvolvimento; produção deve fixar uma versão efetivamente liberada e suportada.
- ERC-20 é padrão de interface para tokens fungíveis. É uma opção para MWN somente se o modelo de emissão, transferência, custódia e liquidação for formalmente definido.
- UMS não deve ser exposta como ERC-20 livremente transferível sem controles adicionais: isso quebraria a regra de segregação e a proibição de transferências diretas entre usuários. Uma representação on-chain teria de restringir transferências ou manter UMS fora da cadeia.
- OpenZeppelin fornece implementações para ERC-20, ERC-721, ERC-1155, controle de acesso, governança e contratos atualizáveis. TimelockController permite atrasar operações administrativas críticas, mas exige configuração correta de proposers, executors e administração.
- Hardhat 3 e Foundry oferecem ambientes de compilação e testes; Foundry inclui fuzzing, invariant testing e fork testing. viem fornece cliente TypeScript modular para JSON-RPC, ABI, contratos e assinaturas.

### 3.3 EVM incorporada versus rede externa

- `revm` pode executar bytecode EVM dentro de aplicações Rust. É uma peça de execução, não uma cadeia completa.
- Besu permite executar cliente EVM em redes públicas e permissionadas. Em rede permissionada, a governança e o conjunto de validadores continuam sendo responsabilidade do operador.
- Cosmos SDK + CometBFT é alternativa para construir uma cadeia de aplicação modular com consenso BFT; Cosmos EVM adiciona compatibilidade EVM. Isso é uma decisão de construir/operar uma cadeia própria, não uma integração leve.
- Rollups processam transações fora da L1 e publicam dados/resumos para liquidação/verificação. A disponibilidade dos dados é parte essencial da segurança; disponibilidade não significa retenção histórica permanente.

### 3.4 Account abstraction e carteiras

ERC-4337 e EIP-7702 ampliam possibilidades de smart accounts, validação programável, recuperação, agrupamento de transações e abstração de gas. São úteis para experiência de carteira, mas não substituem a segregação econômica UMS, a custódia de MWN nem os controles da MW-Ex.

## 4. Custos, licenças e maturidade

- EVM, Solidity, OpenZeppelin, Hardhat, Foundry, viem e revm possuem ecossistemas públicos e documentação/repositórios acessíveis sem contratar um fornecedor para estudar ou desenvolver localmente.
- A adoção on-chain em produção não é gratuita: há taxas de rede, operação de nós/RPC, indexação, monitoramento, auditorias e eventuais serviços de carteira/relayer. Provedores externos podem oferecer planos gratuitos limitados, mas não devem ser confundidos com infraestrutura sem custo ou garantias.
- A licença de cada versão e dependência deve ser confirmada no repositório/tag exato antes de incorporação. Este catálogo não constitui parecer jurídico de licenciamento.
- Ferramentas maduras reduzem esforço de desenvolvimento, mas não eliminam custo de segurança, operação, governança e suporte.

## 5. Conclusão do WP26.2

Há um conjunto amplo de componentes reutilizáveis que evita reconstruir linguagem, runtime, padrões de token, permissões, bibliotecas, SDKs e ferramentas de teste. A principal separação arquitetural a preservar é entre execução EVM e consenso.

A hipótese de menor esforço não é necessariamente migrar a MeshWave para Ethereum. Pode ser adotar tooling e padrões EVM sem mover o ledger; ou, se houver requisito de execução on-chain, usar uma rede EVM existente ou cliente maduro em vez de escrever uma EVM própria.

Nenhuma alternativa é aprovada por este OR. A comparação A–F e a arquitetura recomendada pertencem aos WP26.4–26.6.

## 6. Fontes primárias consultadas

- EVM: https://ethereum.org/developers/docs/evm/
- Nodes and clients: https://ethereum.org/developers/docs/nodes-and-clients/
- Ethereum standards: https://ethereum.org/developers/docs/standards/
- Solidity releases: https://www.soliditylang.org/
- Solidity documentation: https://docs.soliditylang.org/en/latest/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/5.x/
- OpenZeppelin Access Control: https://docs.openzeppelin.com/contracts/5.x/access-control
- Hardhat 3: https://hardhat.org/docs/getting-started
- Foundry Forge: https://www.getfoundry.sh/forge/index.html
- viem: https://viem.sh/docs/getting-started
- revm: https://docs.rs/revm/latest/revm/
- ERC-4337: https://eips.ethereum.org/EIPS/eip-4337
- Account Abstraction: https://ethereum.org/roadmap/account-abstraction
- Data availability: https://ethereum.org/developers/docs/data-availability/
- Hyperledger Besu: https://launchpad.ethereum.org/en/besu
- Cosmos SDK: https://github.com/cosmos/cosmos-sdk
- CometBFT: https://github.com/cometbft/cometbft
