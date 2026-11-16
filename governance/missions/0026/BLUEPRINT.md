# BLUEPRINT — MISSION_0026
## Avaliação Estratégica e Técnica de Reaproveitamento da Stack Ethereum no Ecossistema MeshWave

**Versão:** 1.0.0  
**Estado:** READY  
**Derivado de:** TR v0.1.0 — VALIDATED  
**Prioridade:** CRÍTICA — nível máximo  
**Autorização:** análise técnica e recomendação; sem implementação ou POC executável.

## 1. Objetivo operacional

Produzir uma decisão arquitetural baseada em evidências para determinar quais tecnologias Ethereum/EVM devem ser adotadas, integradas, adaptadas, mantidas próprias, substituídas ou descartadas na MeshWave. O trabalho deve reduzir esforço proprietário sem comprometer a economia, a segurança e a diferenciação do ecossistema.

## 2. Princípios de execução

- O TR aprovado é a fonte normativa desta missão.
- Não presumir que documentação antiga descreva o estado atual.
- Inspecionar somente componentes diretamente relacionados ao escopo.
- Todo fato sobre implementação MeshWave exige evidência rastreável: caminho, commit, teste, deployment, consulta read-only ou log.
- Distinguir fato, hipótese, inferência, recomendação e decisão do responsável.
- Não atribuir agente fixo; o SCP faz a atribuição conforme disponibilidade e elegibilidade.
- Cada unidade assumida gera OR próprio com evidências, conclusão e pendências.
- Sem investimento externo, não avançar para desenvolvimento além do conceito.
- Não iniciar execução paga nem criar dependência comercial.

## 3. Limites de segurança

Esta missão não autoriza:
- alteração de código, contratos, tokens, supply, carteiras, chaves, saldos, ledger, ordens ou dados financeiros;
- deploy, transação, migração, POC executável ou testes com fundos;
- criação de RPC, bridge, validador, infraestrutura ou serviço pago;
- alteração de schema, RLS, policies ou grants fora da correção pontual já autorizada para `sofia."governanceMissions"`;
- mudança das regras econômicas UMS/MWN/MW-Ex.

A correção RLS autorizada é limitada à tabela de governança desta missão e deve ser documentada separadamente.

## 4. Work packages e dependências

### WP26.1 — Baseline e inventário MeshWave
**Objetivo:** estabelecer o estado real dos componentes.
- Localizar repositórios e módulos atuais de blockchain/rede, MWN, UMS, MW-Ex, ledger, carteiras, PoUW, nós e infraestrutura.
- Identificar branch, commit, data, deployments e evidências disponíveis.
- Classificar cada componente: produção comprovada, produção parcial, piloto/protótipo, desenvolvimento, conceito/roadmap ou não localizado.
- Verificar as regras econômicas no código e no banco, sem alterar dados.
**Saída:** inventário rastreável e mapa de dependências.
**Aceite:** nenhuma classificação operacional sem evidência concreta.

### WP26.2 — Catálogo de tecnologias Ethereum/EVM
**Objetivo:** identificar componentes maduros reutilizáveis.
- EVM, Solidity e linguagens alternativas compatíveis.
- Padrões ERC relevantes e seus limites.
- Clientes, bibliotecas, SDKs, ferramentas de teste, auditoria e verificação.
- Carteiras, gestão de chaves, assinatura e account abstraction.
- RPC, indexadores, explorers, infraestrutura e observabilidade.
- L2/rollups e appchains EVM.
- Licenças, maturidade, manutenção, vulnerabilidades e dependência de fornecedores.
**Saída:** catálogo com maturidade, licença, custo, riscos e casos de uso.
**Aceite:** fontes primárias atuais e distinção entre protocolo aberto e serviço comercial.

### WP26.3 — PoUW e arquitetura de consenso
**Objetivo:** avaliar PoUW sem confundi-lo com execução EVM ou consenso.
- Separar consenso, execução, computação útil, verificação e recompensa.
- Mapear propostas e implementações verificáveis de PoUW.
- Avaliar Sybil, trabalho falso/duplicado, verificabilidade, incentivos, centralização, energia, latência e custo de validação.
- Determinar se PoUW deve ser consenso, mercado de computação, camada de contribuição, mecanismo de recompensa ou combinação.
**Saída:** relatório técnico de viabilidade e ameaças.
**Aceite:** nenhuma alegação de segurança sem modelo de ameaça e evidência.

### WP26.4 — Mapa de equivalências e gaps
**Objetivo:** comparar capacidades MeshWave atuais com componentes Ethereum existentes.
- Mapear sobreposição funcional.
- Identificar código proprietário que replica soluções maduras.
- Identificar requisitos MeshWave sem equivalente pronto.
- Separar substituição técnica de redefinição econômica.
**Saída:** matriz componente MeshWave × alternativa existente.
**Aceite:** cada recomendação possui justificativa técnica e custo/risco de mudança.

### WP26.5 — Comparação de arquiteturas
**Objetivo:** comparar alternativas A–F do TR.
- Ethereum mainnet.
- L2 EVM.
- Appchain/sidechain EVM.
- Runtime próprio com EVM incorporada/compatibilidade seletiva.
- Arquitetura atual com adoção seletiva de tooling/padrões.
- Alternativa não-EVM quando tecnicamente justificável.
Aplicar critérios comuns: segurança, maturidade, custo, throughput/finalidade, descentralização, governança, privacidade, interoperabilidade, esforço, manutenção, lock-in, tooling, liquidez e compatibilidade com PoUW.
**Saída:** matriz ponderada, pesos explicados e análise de sensibilidade.
**Aceite:** pesos não podem ser escolhidos para forçar uma conclusão; expor incertezas e trade-offs.

### WP26.6 — Arquitetura-alvo e matriz de reaproveitamento
**Objetivo:** formular recomendação.
- Definir fronteiras on-chain/off-chain.
- Definir papel da EVM, contratos, MWN, UMS, MW-Ex, ledger e PoUW.
- Definir quais componentes adotar, integrar, adaptar, manter próprios, substituir ou não usar.
- Explicitar como impedir transferências UMS não autorizadas e contorno do gateway MW-Ex.
**Saída:** diagrama lógico, matriz de decisões e controles.
**Aceite:** todas as regras invariáveis do TR demonstravelmente preservadas ou incompatibilidades submetidas ao responsável.

### WP26.7 — Impactos, migração e riscos
**Objetivo:** identificar consequências da recomendação sem executar migração.
- Impacto sobre emissão, supply, saldos, histórico, endereços, custódia, contratos e integração MW-Ex.
- Riscos de chaves, upgrades, bridges, oráculos, consenso, disponibilidade, privacidade, governança e conformidade.
- Estratégia conceitual de coexistência, migração ou não migração.
**Saída:** matriz de riscos, controles, dependências e reversibilidade.
**Aceite:** nenhuma alteração de estado real; riscos residuais explicitados.

### WP26.8 — Síntese executiva e decisão go/no-go
**Objetivo:** entregar decisão acionável.
- Consolidar recomendação e alternativas rejeitadas.
- Indicar o que MeshWave deve parar de construir, reaproveitar e manter próprio.
- Estimar esforço/custo em faixas qualitativas e identificar dependências.
- Propor fases futuras e critérios de entrada/saída.
- Identificar validação externa necessária antes de qualquer investimento de desenvolvimento.
**Saída:** relatório final, apresentação executiva e decisão solicitada ao responsável.
**Aceite:** conclusão inequívoca, rastreável e sem autorização implícita para implementação.

## 5. Ordem de execução e gates

| Ordem | Unidade | Dependência | Gate de saída |
|---|---|---|---|
| 1 | WP26.1 | TR aprovado + Blueprint READY | Baseline com evidências |
| 2 | WP26.2 | TR aprovado + Blueprint READY | Catálogo tecnológico |
| 3 | WP26.3 | TR aprovado + Blueprint READY | Análise PoUW separada |
| 4 | WP26.4 | WP26.1–26.3 | Mapa de equivalências |
| 5 | WP26.5 | WP26.4 | Matriz A–F |
| 6 | WP26.6 | WP26.5 | Arquitetura recomendada |
| 7 | WP26.7 | WP26.1, WP26.5, WP26.6 | Impactos e riscos |
| 8 | WP26.8 | WP26.7 | Relatório final e decisão |

WP26.1, WP26.2 e WP26.3 podem ser conduzidos em paralelo se houver agentes elegíveis e se não houver duplicidade de esforço. As demais unidades respeitam as dependências indicadas.

## 6. Evidências e Operational Reports

Cada OR deve registrar:
- unidade e responsável/agente executor;
- período e escopo efetivamente executado;
- fontes, URLs, commits, arquivos, testes, deployments ou consultas;
- fatos observados separados de hipóteses;
- achados positivos e negativos;
- limitações de acesso e lacunas;
- conclusão da unidade e recomendação;
- próxima dependência e estado atualizado.

O índice e o quadro de tarefas devem ser atualizados após cada OR. Não declarar uma unidade concluída sem artefato e evidências.

## 7. Critérios globais de conclusão

A missão só pode ser encerrada quando:
- os oito work packages estiverem concluídos ou formalmente bloqueados com justificativa;
- inventário e matriz de decisão tiverem evidências;
- PoUW tiver análise independente de consenso/EVM;
- arquitetura recomendada preservar as regras UMS/MWN/MW-Ex ou expor claramente qualquer conflito;
- riscos e impactos estiverem documentados;
- relatório final apresentar decisão recomendada e gates;
- o responsável tiver recebido a recomendação para decisão.

## 8. Resultado esperado

Uma resposta objetiva à pergunta central:

**Quais partes da MeshWave devemos deixar de construir do zero porque já existem soluções maduras que podemos reaproveitar, e quais partes precisam continuar sendo nossas porque constituem a diferenciação real do ecossistema?**

O fechamento da análise não autoriza POC, implementação, migração ou deploy. Essas atividades exigem decisão humana, validação de interesse externo e missão/gate próprios.
