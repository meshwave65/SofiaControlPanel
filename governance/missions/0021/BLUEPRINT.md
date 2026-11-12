# Blueprint da MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma

**Missão:** MISSION_0021  
**Estado:** PROGRESS
**Data:** 2026-11-10  
**Orquestrador:** SofiaControlPanel (SCP)  
**Projeto-alvo:** MeshWave / newsite

## 1. Motivação e evidência inicial

O responsável solicita a primeira MW-Ex funcional, pequena e proprietária, operada pela interface MeshWave e restrita a MeshWalkers. Ela pode ficar visualmente próxima da carteira MWN, mas deve ser autônoma, com saldo, razão e histórico próprios, segregados da carteira interna UMS.

A tela atual em newsite/src/pages/MwEx.jsx exibe “Em breve” e cartões candidatos MWN, BTC, ETH, Ibovespa, S&P 500 e IPCA. Isso comprova uma prévia visual, não cotações nem operação. A MISSION_0018, tarefa 18.4, documentou escopo/readiness; esta missão trata da implementação funcional, sem reescrever a decisão histórica. A carteira existente mostra uma equivalência UMS/MWN na interface; seu valor deve ser lido da fonte canônica versionada identificada pela chave `UMS_PER_MWN`. Estado de banco, regras vigentes, saldos, liquidez, fontes de preço e auditoria Genesis deverão ser reconfirmados na tarefa 21.1.

## 2. Objetivo e princípios de produto

Implementar e validar uma exchange proprietária, simples e privada, somente para MeshWalkers, que mantenha MWN em ledger próprio, permita transferências entre participantes por MWN e conversões explícitas entre MWN e UMS, exiba o saldo MWN, o potencial equivalente em UMS, o valor da carteira segundo cotação verificável e alguns indicadores/cotações externas somente para referência.

A autenticação do site pode ser reutilizada se apropriado; a autorização e a contabilidade da exchange continuam separadas. A carteira interna conserva UMS; a MW-Ex conserva MWN. A interoperabilidade entre elas só ocorre por uma ponte explícita, autenticada, atômica, auditável e reconciliável.

## 3. Requisitos fornecidos pelo responsável

1. **Acesso privado:** acesso pela interface MeshWave e somente por usuários autenticados elegíveis como MeshWalkers. Sem exchange pública, autoinscrição pública ou endpoint de trading externo.
2. **Ledger próprio:** saldo e histórico MWN por usuário são mantidos pela MW-Ex. Não derivar saldo de leitura lateral da carteira interna nem compartilhar/mutar os dois ledgers por efeito colateral.
3. **Saldo e equivalência:** exibir saldo MWN e equivalência potencial = MWN × parâmetro `UMS_PER_MWN`. Identificar equivalência como potencial; não a apresentar como UMS disponível antes da conversão concluída.
4. **Valor da carteira:** saldo MWN × cotação MWN atual em moeda configurada. Mostrar fonte, moeda, horário e estado de frescor. Sem fonte aprovada e atual, não inventar preço nem chamar referência interna de cotação de mercado; mostrar indisponível ou referência explicitamente indicativa.
5. **Indicadores externos:** feed somente leitura. Confirmar provedor, unidades, frequência e limites antes de integrar. Candidatos já visíveis na prévia não garantem disponibilidade. Mostrar fonte e horário, sinalizar atraso/falha, nunca chamar dado stale de “ao vivo”.
6. **Transferência entre participantes:** caminho normal de UMS entre participantes: remetente converte explicitamente UMS em MWN na MW-Ex; transfere MWN à carteira MW-Ex do destinatário; destinatário decide manter MWN ou convertê-lo explicitamente em UMS na carteira interna.
7. **Sem exceção para fundador:** após a auditoria Genesis e a reconciliação formal, Genesis deixa de ser classe separada e se torna UMS comum na carteira interna pessoal do fundador, conforme decisão informada. Depois disso, o fundador também usa o mesmo fluxo via MWN; não há transferência direta UMS→UMS entre usuários nem bypass administrativo.
8. **Retirar aquisição normal de UMS:** o fluxo de aquisição de UMS pela carteira interna não é caminho normal do modelo. Planejar sua retirada somente após a ponte de transferência estar testada, os saldos reconciliados, rollback preparado e aprovação explícita. A carteira interna de UMS não é descontinuada integralmente nesta missão.
9. **Relação de conversão:** consumir o parâmetro versionado `UMS_PER_MWN` da fonte canônica. Confirmar a versão ativa antes de operação; definir precisão, arredondamento e resíduos. Conversão não pode criar valor ou permitir gasto duplo.
10. **Escopo mínimo:** sem depósito/saque fiat, PIX/cartão, CEX/DEX, execução externa de ordens, bridge blockchain, alavancagem, derivativos, market-making garantido ou ampliação funcional sem nova decisão.

## 4. Escopo de implementação

- Reconciliar código atual, fluxo de autenticação/estado MeshWalker, APIs, bancos, políticas de acesso, ledgers, preço e deploy.
- Definir modelo mínimo de contraparte/liquidez, preço de MWN, transação, limites, cancelamento/falha e reconciliação; encaminhar decisões econômicas não fornecidas ao responsável.
- Implementar carteira/ledger MW-Ex segregado e ponte explícita para conversão/transferência, idempotente e com trilha de auditoria.
- Permitir manter e transferir MWN dentro da exchange e converter MWN em UMS interno conforme o modelo aprovado.
- Integrar feed externo read-only para cotações/indicadores selecionados; não executar ordens em terceiros.
- Construir uma UI responsiva e minimalista com saldo MWN, UMS potencial, valor de mercado verificável, fonte/horário e as ações aprovadas.
- Testar autorização, isolamento, invariantes contábeis, precisão, concorrência, falhas, cotações atrasadas/ausentes e compatibilidade dos fluxos de carteira.
- Preparar plano reversível de retirar a aquisição normal de UMS e tratar a conversão Genesis pós-auditoria; não executar esses cutovers sem gates explícitos.

## 5. Fora de escopo

- Acesso público, exchange/mercado público, autoinscrição, bridge blockchain, listagem ou conexão operacional a CEX/DEX.
- Fiat, PIX, cartões, depósitos/saques, custódia externa, nova emissão de MWN/UMS.
- Livro público de ordens, trading especulativo, alavancagem, derivativos, garantia de liquidez ou valor.
- Confundir preço indicativo com preço executável ou mercado líquido.
- Alterar tokenomics, supply, direitos ou regras econômicas não fornecidas.
- Migrar saldo Genesis, alterar dados/schema de produção, desligar aquisição normal de UMS, permitir transação real ou publicar deploy sem ambiente e autorização correspondentes.
- Declarar auditoria, validação jurídica/regulatória ou segurança independente sem evidência específica.

## 6. Controles obrigatórios

- **MeshWalker-only:** autorização aplicada no servidor e nas políticas de dados, com negação por padrão quando elegibilidade não puder ser verificada.
- **Segregação:** saldo UMS e saldo MWN em domínios contábeis distintos; histórico por carteira; nenhuma leitura lateral como mecanismo de conciliação.
- **Ponte:** cada conversão/transferência registra identificador idempotente, origem/destino, ator, ativo, quantias, relação aplicada, horário e estado. Repetição, concorrência, falha parcial e reversão não podem duplicar crédito nem deixar saldo inconsistente.
- **Preço:** armazenar símbolo, valor, moeda-base, fonte, horário do provedor, horário de ingestão e frescor. Definir TTL e comportamento de falha; sem preço atual, não exibir market value como atual.
- **Feeds:** read-only, limites de requisição e segredos somente no servidor. Falha do feed não muda saldos nem autoriza cotação inventada.
- **Privacidade:** participante vê apenas sua própria carteira e dados públicos de mercado; operações administrativas têm autoria e motivo registrados.

## 7. Decomposição

O quadro MISSION_0021 - TASKS - STAGED.md organiza oito unidades. As tarefas 21.1 e 21.2 antecedem mudanças de banco, ledger ou UI que assumam política econômica. Cada tarefa será atribuída antes de execução e exigirá seu próprio Operational Report. A MISSION_0020 está PROGRESS; a MISSION_0021 permanece STAGED até seleção compatível com governança, prioridade e locks.

## 8. Gates

- Reconciliar MISSION_0018/18.4 e confirmar a versão aprovada de `UMS_PER_MWN` antes de operação real.
- Definir e aprovar a natureza e fonte da cotação MWN e o modelo de contraparte/liquidez. Não chamar referência de mercado sem preço verificável.
- Confirmar elegibilidade MeshWalker na fonte canônica.
- Para migração Genesis: auditoria concluída, saldos reconciliados, evento de migração demonstrável, reconciliação da carteira do fundador, rollback preparado e autorização explícita.
- Para retirar a aquisição normal de UMS: ponte validada ponta a ponta em ambiente autorizado, saldos reconciliados, plano de retorno e autorização explícita.
- Para transação real ou deploy de produção: ambiente, usuários, limites e controles aprovados; autorização explícita. A criação desta missão não autoriza movimentar ativos.

## 9. Entregáveis e critérios de aceite

- Matriz do estado atual e requisito→implementação→evidência.
- Modelo funcional, decisão de preço/contraparte, fluxo de conversão e mapa de dados/permissões.
- MW-Ex privada com ledger próprio, ponte explícita, transações seguras e UI minimalista, conforme gates aprovados.
- Feed externo read-only com proveniência e manejo de dado ausente/atrasado.
- Testes repetíveis para autorização, isolamento, idempotência, concorrência, precisão, reconciliação e falhas.
- Plano reversível para a transição de UMS e pós-auditoria Genesis, sem alegar auditoria inexistente.
- Guia operacional, handoff e Operational Reports.

Critérios:
1. Outro agente consegue assumir a missão a partir dos artefatos versionados.
2. Apenas MeshWalkers autorizados acessam a MW-Ex; saldo/ledger MWN são independentes da carteira interna UMS.
3. O fluxo explícito UMS→MWN→destinatário MWN e a conversão opcional para UMS interno funcionam sem transferência direta UMS→UMS.
4. Fundador usa a mesma regra, sem bypass.
5. UMS potencial = MWN × `UMS_PER_MWN`, exibido sem parecer saldo disponível.
6. Valor de mercado depende de cotação verificável e atual; preço/fonte/horário aparecem e ausência/staleness são sinalizados.
7. Indicadores externos são read-only e identificam fonte/frescor.
8. Testes cobrem invariantes, precisão, concorrência, repetição, erros e autorização.
9. Aquisição normal de UMS só é retirada e Genesis só é migrada depois dos gates e autorização.
10. Para alterações de código, pnpm check, pnpm test e pnpm build passam e os ORs registram evidências e limites.
11. Missão fica aberta se preço/liquidez, auditoria Genesis, reconciliação ou autorização essencial estiverem pendentes.

## 10. Limites de declaração

Este Blueprint não afirma que MW-Ex já negocia, que MWN possui cotação/mercado líquido, que a equivalência UMS/MWN foi auditada, que a auditoria Genesis terminou ou que algum saldo foi migrado. Placeholder não pode ser apresentado como operação; “valor de mercado” requer fonte atual e representativa.

## 11. Aditamento econômico e nomenclatura — 2026-11-11

Este aditamento registra decisões posteriores do responsável e prevalece sobre qualquer item anterior deste Blueprint que as contradiga.

### 11.1 Nomenclatura oficial e legado técnico

- A denominação vigente e única do ativo é **MWN — MeshWave Network**.
- **MWC** é exclusivamente uma designação histórica/legada, originalmente usada para “MeshWave Cripto” e abandonada após a identificação de outro token em circulação com essa designação.
- Identificadores técnicos existentes com o prefixo/símbolo mwc — inclusive tabelas, campos, variáveis, módulos, serviços e o simulador mwc-bm51.onrender.com — são legados. Sua existência não define um ativo separado nem altera a nomenclatura vigente.
- Documentação nova, interfaces, contratos e conceitos devem usar MWN. Não renomear identificadores técnicos automaticamente: qualquer migração exige análise de dependências, compatibilidade, plano reversível e aprovação explícita.

### 11.2 Fiat, aquisição de UMS e ordens externas

- Continua permitido o mecanismo existente de **aquisição de UMS mediante moeda fiduciária**. Isso não constitui conversão de UMS de volta para fiat.
- É proibida a conversão direta UMS→fiat e a conversão direta UMS→token externo.
- Para alcançar ativos externos, o caminho obrigatório é **UMS → MWN → moeda fiduciária (BRL/USD/EUR, conforme suporte aprovado) → ativo/token externo**.
- Para ordens externas, a etapa UMS→MWN ocorre pela ponte interna; MWN é então vendido por moeda fiduciária; a moeda fiduciária resultante liquida a compra do ativo externo.
- A disponibilidade de saldos fiat, depósitos, retiradas, meios de pagamento, execução externa e custódia depende de desenho operacional, jurídico, técnico e de autorização próprios. Este aditamento define o caminho econômico pretendido, mas não declara tais capacidades implementadas nem autoriza operação real.

### 11.3 Modos de financiamento de ordens

A interface de ordem deve permitir ao usuário escolher a origem dos recursos:

1. **Somente UMS:** converter UMS em MWN e, quando a ordem envolver ativo externo, seguir MWN→fiat→ativo externo.
2. **Somente fiat:** financiar integralmente a ordem com saldo fiat disponível.
3. **Híbrido fiat:** consumir primeiro o saldo fiat; se insuficiente, complementar com UMS, passando obrigatoriamente por UMS→MWN→fiat.
4. **Híbrido UMS:** consumir primeiro UMS; se insuficiente, complementar com saldo fiat. A parcela UMS percorre UMS→MWN→fiat.

A prioridade define apenas qual saldo é consumido primeiro; não cria conversão direta UMS↔fiat nem UMS↔ativo externo. Para ordens de MWN, a perna fiat adquire MWN conforme mecanismo aprovado; para ativos externos, fiat é a moeda intermediária de liquidação.

### 11.4 Precisão, apresentação e taxas

- MWN é unidade inteira: não existem frações de MWN.
- A interface apresenta quantidades sem casas decimais, truncando para baixo. Essa regra é exclusivamente visual e não altera os valores armazenados.
- A contabilidade interna UMS preserva sua precisão integral; a apresentação sem decimais não pode arredondar, truncar ou modificar o saldo efetivo.
- A relação de referência é definida pela chave **`UMS_PER_MWN`**, mantida na fonte canônica versionada. Seu valor não pode ser replicado como constante no código ou em documentos; cada transação conserva o ID/versão e o valor efetivamente aplicado.
- A regra de conversão deve preservar resíduos UMS; nenhuma fração ou saldo residual pode ser descartado silenciosamente. O comportamento transacional exato para valores que não formem MWN inteiro precisa ser definido no contrato de conversão antes de operação real.
- Taxas de corretagem/administrativas atuais: zero. Se introduzidas futuramente, serão parametrizadas e debitadas sempre da carteira interna UMS, nunca do saldo MWN nem do saldo fiat da MW-Ex.

## Governança de parâmetros

Esta missão obedece à [Diretriz de arquitetura — Configuração e governança de parâmetros](../../CONFIGURATION_AND_PARAMETER_GOVERNANCE.md). A chave `UMS_PER_MWN` e sua fonte canônica estão registradas no [Registro canônico de parâmetros](../../parameters/README.md). O valor não deve ser copiado para código ou documentação operacional.
