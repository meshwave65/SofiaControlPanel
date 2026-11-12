# MISSION_0021 / Tarefa 21.2 — Modelo funcional mínimo e gates econômicos

> **Atualização de status — 10/11/2026:** este documento foi elaborado antes da implantação do MVP custodial da MW-Ex. As decisões e gates econômicos continuam como referência de desenho, mas afirmações sobre ausência de conversões, ledger ou operação refletem o baseline anterior. A MW-Ex está agora operacional em modalidade interna, conforme [OR-20261110-0046](../../operational_reports/OR-20261110-0046.md). A validação operacional ampliada e as cotações externas read-only permanecem frentes distintas.


**Projeto:** Projeto Triangulo / SofiaControlPanel / MeshWave  
**E-mail do usuário Manus:** 2.15080907e+08+meshwave65@users.noreply.github.com  
**Data e hora:** 10/11/2026, 09:21 (-03:00)  
**Estado:** SPECIFICATION_CHECKPOINT  
**Dependência:** `MWEX_STATE_INVENTORY_21_1.md` e `OR-20261110-0036`

## 1. Objetivo e limite

Este documento fecha o modelo funcional mínimo proposto para a MW-Ex e separa o que pode ser implementado em sandbox do que exige decisão/aprovação. Não autoriza criação de saldo, migração Genesis, alteração de produção, execução de ordem, compra/venda externa, depósito/saque, emissão de MWN/UMS ou deploy.

A MW-Ex deve ser uma carteira/razão privada de MWN com transferências internas explícitas e conversões auditáveis com a carteira UMS. Não será um livro público de ordens, CEX/DEX, ponte blockchain ou mercado com liquidez garantida.

## 2. Vocabulário econômico obrigatório

| Termo | Significado operacional | Pode ser exibido como |
|---|---|---|
| Saldo MWN | Quantidade efetivamente registrada no ledger MW-Ex do usuário | Saldo disponível MWN |
| UMS potencial | `saldo MWN × 1.000`, equivalência matemática sem crédito na carteira UMS | Equivalência potencial, nunca saldo UMS |
| Cotação indicativa | Referência externa ou interna claramente identificada, com fonte e horário, sem garantia de execução | Indicativa / não executável |
| Preço executável | Preço aceito por uma contraparte disponível para uma transação autorizada | Só após mecanismo de contraparte aprovado |
| Valor de carteira | `saldo MWN × cotação` somente se cotação atual, proveniência e frescor forem válidos | Valor estimado, com fonte e timestamp |
| Liquidez | Capacidade real e autorizada de uma contraparte de aceitar a conversão/transferência no preço e limite definidos | Estado/gate, não promessa |
| Genesis | Estado histórico da carteira emissora; não é exceção permanente nem bypass do fluxo normal | Pendente de auditoria/reconciliação |

## 3. Fluxos mínimos propostos

### 3.1 Manter MWN

1. Usuário elegível autentica-se na interface MeshWave.
2. Servidor autoriza acesso MeshWalker-only.
3. Sistema lê exclusivamente o ledger MW-Ex do usuário.
4. UI mostra saldo MWN e calcula UMS potencial, sem lançar UMS.
5. Toda consulta é read-only e não altera saldo.

### 3.2 Remetente converter UMS em MWN

1. Remetente inicia uma conversão explícita na MW-Ex.
2. Serviço verifica autorização, saldo UMS disponível, limite, relação vigente, precisão e idempotency key.
3. Serviço debita UMS na carteira interna e credita MWN no ledger MW-Ex em uma operação atômica de ponte, ou rejeita tudo.
4. O evento registra origem, destino, ator, ativos, quantidades, relação, timestamps, motivo, estado e referências cruzadas.
5. Falha, repetição ou concorrência não pode criar crédito duplicado.

**Gate:** este fluxo não deve ser implementado contra produção até contrato da ponte, isolamento/RLS, reconciliação, rollback e autorização estarem aprovados. A tarefa 21.2 apenas especifica o comportamento.

### 3.3 Transferir MWN entre participantes

1. Remetente informa identificador do destinatário e quantidade MWN.
2. Servidor resolve destinatário elegível sem expor dados privados desnecessários.
3. Verifica saldo disponível, limites, status da carteira, idempotency key e não auto-transferência se a política aprovada exigir.
4. Debita MWN do remetente e credita MWN do destinatário atomicamente no ledger MW-Ex.
5. Ambos recebem histórico da própria carteira; nenhum UMS é alterado.

Não existe transferência direta UMS→UMS entre participantes.

### 3.4 Destinatário converter MWN em UMS

1. Destinatário inicia conversão explícita para sua própria carteira interna.
2. Serviço verifica saldo MWN, relação vigente, precisão, limites e autorização.
3. Debita MWN no ledger MW-Ex e credita UMS na carteira interna em ponte atômica, reconciliável e idempotente.
4. O UMS creditado torna-se saldo efetivo somente após conclusão confirmada do evento.

**Gate:** não implementar antes da tarefa 21.3 definir isolamento e contrato da ponte e da tarefa 21.7 validar falha parcial/rollback.

### 3.5 Fundador e Genesis

O fundador não possui bypass. O tratamento pretendido é:

1. auditar saldo/eventos Genesis;
2. reconciliar carteira, ledger e eventos;
3. registrar evento de transição demonstrável e reversível;
4. reclassificar Genesis como UMS comum na carteira interna pessoal, se a auditoria confirmar a decisão;
5. depois disso, aplicar ao fundador exatamente o mesmo fluxo UMS→MWN→transferência→MWN/UMS.

Nenhuma etapa acima foi executada. Genesis permanece gate bloqueante.

## 4. Modelo de preço e liquidez

### 4.1 Três camadas que não podem ser confundidas

- **Referência configurada:** parâmetro interno, como o valor hoje presente em `src/config.js`; serve para simulação/indicação, não para afirmar mercado.
- **Cotação de referência:** preço obtido de fonte aprovada, com símbolo, moeda, valor, horário do provedor, horário de ingestão, TTL, status e proveniência; ainda pode não ser executável.
- **Preço executável:** preço aceito por uma contraparte autorizada dentro de limites; exige mecanismo de liquidez, autorização e registro de execução.

A MW-Ex deve inicialmente funcionar sem prometer preço executável. Se não houver fonte atual aprovada, a UI deve mostrar “cotação indisponível” ou “referência indicativa”, nunca zero, preço fabricado ou “ao vivo”.

### 4.2 Liquidez/contraparte mínima

O escopo mínimo seguro não garante market-making nem liquidez. Para habilitar conversão economicamente executável, é necessário definir:

- quem é a contraparte legal/operacional;
- de onde vem o estoque de MWN/UMS;
- limites por usuário, transação e período;
- preço, spread, slippage e validade da proposta;
- comportamento quando não houver contraparte;
- reserva, reconciliação e rollback;
- autorização para o ambiente e os usuários.

Até essas respostas, pode-se implementar apenas carteira, transferência interna sintética e cotação read-only em fixtures.

## 5. Precisão, arredondamento e resíduos

Parâmetro de referência: **1 MWN = 1.000 UMS**.

Proposta segura para implementação, sujeita à confirmação normativa:

- armazenar valores em unidades inteiras atômicas, nunca em `float`;
- manter escala explícita de MWN e UMS no contrato;
- UMS efetivo mantém até 6 casas decimais conforme modelo contábil existente;
- MWN deve ter escala definida antes do schema; não assumir que o legado `mwc_quantity` é a escala normativa;
- conversão UMS→MWN deve rejeitar quantidade que não possa ser representada exatamente ou aplicar regra de arredondamento aprovada, registrando resíduo;
- conversão MWN→UMS deve multiplicar por 1.000 e validar escala/overflow;
- nunca arredondar silenciosamente em favor do sistema ou usuário;
- soma de débito e crédito de cada ponte deve ser igual em unidades atômicas e moeda contábil correspondente;
- qualquer resíduo deve ter conta/evento explícito, proprietário e política de reconciliação;
- repetição da mesma idempotency key deve retornar o resultado original, não executar novamente.

**Decisão pendente:** escala normativa de MWN, política para frações não representáveis, tratamento de resíduos e limites de conversão.

## 6. Gates econômicos e status

| Gate | Status | Evidência/ação necessária |
|---|---|---|
| Relação 1:1.000 | Registrada como requisito/referência | Reconfirmar como regra normativa antes de operação |
| Ledger MWN separado | Ausente no estado auditado | Especificar em 21.3; implementar somente depois |
| Fonte de cotação MWN | Não aprovada | Decidir fonte, símbolo, moeda, TTL, fallback e limites |
| Preço executável | Não definido | Definir contraparte, mecanismo e autorização; não presumir liquidez |
| Escala MWN | Não definida | Aprovar precisão, atomic units e arredondamento |
| Política de resíduos | Não definida | Aprovar conta/evento e reconciliação |
| Eligibility MeshWalker-only | Não comprovada na rota atual | Definir fonte canônica e enforcement server-side/RLS |
| Genesis | Não auditado/reconciliado | Auditoria, evento de transição, rollback e autorização |
| Retirada da aquisição normal de UMS | Não autorizada | Só após ponte validada, reconciliação e aprovação explícita |
| Operação real/deploy | Não autorizado | Ambiente, usuários, limites, controles e autorização específica |

## 7. Decisões encaminhadas ao responsável

Estas decisões não foram inventadas pelo agente e bloqueiam a operação real:

1. A relação **1 MWN = 1.000 UMS** é normativa e definitiva para a primeira versão?
2. Qual escala/precisão normativa do MWN e qual política de arredondamento/resíduo deve ser usada?
3. O MVP deve limitar-se a ledger/transferência interna e conversões sintéticas, sem preço executável?
4. Qual será a fonte aprovada de cotação indicativa MWN, moeda-base, TTL e fallback?
5. Existe contraparte/liquidez autorizada? Se sim, qual entidade, estoque, limites e mecanismo; se não, a operação deve permanecer simulada/read-only?
6. Qual é a fonte canônica de elegibilidade MeshWalker e quais critérios server-side devem bloquear acesso?
7. A auditoria Genesis será feita antes de qualquer conversão real? Quem aprova e qual evidência é suficiente?
8. A retirada do caminho normal de aquisição de UMS fica explicitamente adiada até os gates da ponte?

## 8. Encaminhamento autônomo seguro

Enquanto as decisões acima não forem aprovadas, o agente pode continuar autonomamente com:

- especificação de isolamento e contrato de ponte na 21.3;
- fixtures sintéticas e testes contábeis na 21.7;
- desenho de API/UI com estado indisponível e sem ação real;
- validação estática/build do repositório somente quando autorizado no repositório de código;
- documentação de readiness, rollback e handoff.

O agente não deve criar saldos reais, chamar RPCs de produção, alterar schema, migrar Genesis, publicar deploy ou apresentar referência como mercado.

## 9. Critério de conclusão da 21.2

A tarefa é considerada concluída documentalmente quando este modelo, os fluxos, gates, precisão, Genesis e decisões pendentes estão versionados; o quadro e o OR apontam para este arquivo; e outra instância consegue iniciar a 21.3 sem reinterpretar as regras.

## 10. Aditamento — decisões econômicas e nomenclatura de 2026-11-11

Este aditamento prevalece sobre trechos anteriores deste documento que sejam incompatíveis.

### 10.1 Nomenclatura

A denominação atual e única é **MWN — MeshWave Network**. **MWC** é designação histórica/legada de “MeshWave Cripto”, abandonada porque já existe outro token em circulação com essa designação. Nomes técnicos existentes com o prefixo/símbolo mwc (tabelas, campos, variáveis, módulos, serviços e mwc-bm51.onrender.com) permanecem identificadores legados até eventual migração deliberada. Não representam um segundo ativo. Documentação e nomenclatura conceitual novas devem usar MWN; não renomear estruturas técnicas sem análise de impacto e aprovação.

### 10.2 Aquisição de UMS e proibição de conversão direta

O mecanismo existente de aquisição de UMS com moeda fiduciária permanece válido. Isso é distinto de converter UMS de volta para fiat. São proibidas:
- conversão direta UMS→fiat;
- conversão direta UMS→qualquer token/ativo externo;
- qualquer atalho que elimine MWN e fiat da rota de aquisição de ativo externo.

A rota obrigatória para ativo externo é **UMS→MWN→BRL/USD/EUR→ativo/token externo**. A ponte UMS→MWN é interna; a venda de MWN gera moeda fiduciária; essa moeda fiduciária liquida a compra externa.

### 10.3 Seleção da origem dos recursos

A ordem deve oferecer quatro modos escolhidos pelo usuário:
- **UMS-only:** usa UMS, convertendo-o em MWN; para ativo externo, segue MWN→fiat→ativo.
- **Fiat-only:** usa somente saldo fiat.
- **Híbrido fiat:** consome fiat primeiro e complementa com UMS, convertido por UMS→MWN→fiat.
- **Híbrido UMS:** consome UMS primeiro e complementa com fiat; a parcela UMS percorre UMS→MWN→fiat.

A prioridade de consumo não altera a rota de conversão. Não existe aresta direta UMS↔fiat nem UMS↔ativo externo.

### 10.4 Precisão, interface e taxa de conversão

- MWN é inteiro, sem unidades fracionárias.
- Quantidades exibidas na interface são apresentadas sem casas decimais, por truncamento para baixo. Isso é apenas formatação visual.
- O ledger e a carteira UMS preservam a precisão integral; a interface não pode alterar o saldo contábil.
- A referência vigente é **1.000 UMS = 1 MWN**, sujeita à revisão após estudo da emissão total de UMS e da valoração dos serviços. A taxa deve ser centralizada, configurável e versionada; transações históricas mantêm a versão aplicada.
- Nenhum resíduo UMS pode ser perdido silenciosamente quando a conversão exigir MWN inteiro. A política operacional de conversão parcial/resíduo ainda precisa ser especificada e aprovada.
- Taxas atuais de corretagem/administrativas são zero. Eventuais taxas futuras serão debitadas exclusivamente em UMS na carteira interna, nunca em MWN ou fiat.

### 10.5 Escopo e autorização

Este modelo econômico prevê suporte a saldos fiat e a ordens de ativos externos por meio da rota acima, mas não afirma que depósito/saque fiat, meios de pagamento, custódia, integração de contraparte ou execução externa estejam implementados. Essas capacidades exigem especificação técnica, operacional e de conformidade, além de autorização explícita, antes de qualquer transação real.
