# Blueprint da MISSION_0023 — Integridade Operacional e Segregação de Ativos da MW-Ex

**Missão:** MISSION_0023  
**Estado:** PROGRESS  
**Criação:** 2026-11-12  
**Orquestrador:** SofiaControlPanel (SCP)  
**Projeto-alvo:** MeshWave / MW-Ex — repositório meshwave65/newsite  
**Missão de origem:** MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma  
**Relação:** missão corretiva complementar; não substitui nem encerra a MISSION_0021.

## 1. Propósito

Corrigir e validar a segregação operacional, contábil e visual entre UMS e MWN na MW-Ex. A interface deve deixar inequívoco que UMS e MWN são ativos mantidos em carteiras/ledgers distintos e que transferências entre usuários ocorrem exclusivamente em MWN, a partir do saldo disponível na MW-Ex.

A missão formaliza a correção de uma falha identificada durante a operação real: os controles da interface compartilhavam a quantidade entre conversões e transferências, e o backend aceitava quantidades fracionárias de MWN em alguns caminhos, apesar de a regra de produto já estabelecer MWN como unidade inteira.

## 2. Evidência de origem e correção factual

A transferência investigada em produção foi localizada na base canônica MeshWave65, projeto Supabase ufylccbdjfzydbwhpmpp:

- Transaction ID: 60847897-ce1d-4cf3-8c30-bf75618d9dea.
- Tipo/estado: MWN_TRANSFER / COMPLETED.
- Quantidade: 462 MWN; mwn_amount_atomic = 462000000.
- Natureza: lançamento de débito de −462000000 unidades atômicas e crédito de +462000000 unidades atômicas.
- Origem: carteira Natureall, user UUID 7a644d43-479c-45a9-af0e-936d96c49c37.
- Destino: carteira vinculada ao user UUID 5b57788b-1abf-4bfe-b810-c48783a68ce0.
- O crédito confirmado foi de 462 MWN, não 4,62 MWN. A afirmação anterior de 4,62 foi um erro de interpretação e fica expressamente corrigida.
- As quatro transferências MWN_TRANSFER existentes foram verificadas: todas possuíam um débito e um crédito de mesmo valor e sinais opostos.
- Consulta adicional encontrou zero lançamentos fracionários e zero quantidades fracionárias nas transações MW-Ex existentes no momento da auditoria. Não havia ADMIN_CREDIT registrado naquele momento.

O responsável informou que a carteira Natureall continha 462.997 UMS e que 462.000 UMS foram convertidas em 462 MWN antes da transferência. Esse saldo UMS anterior é informação fornecida pelo responsável; a consulta contábil citada acima confirma os dois lados da transferência MWN, não reconstrói por si só o saldo histórico de UMS.

## 3. Invariantes obrigatórios

### 3.1 Segregação de ativos

- UMS permanece na carteira interna e no ledger UMS.
- MWN permanece na carteira/ledger próprios da MW-Ex.
- A equivalência de referência é 1 MWN = 1.000 UMS, consumida por conversões explícitas.
- UMS potencial equivalente não é saldo UMS disponível e nunca pode ser apresentado como tal.
- Nenhuma transferência entre usuários pode debitar UMS, creditar UMS diretamente ou compartilhar um campo/quantidade de conversão como origem da transferência.

### 3.2 Conversão e reconversão

Um bloco exclusivo deve conter as duas operações, claramente identificadas:

- UMS → MWN: consumir saldo UMS real da carteira interna; aceitar somente múltiplos positivos de 1.000 UMS; creditar MWN na carteira MW-Ex.
- MWN → UMS: consumir saldo MWN real da MW-Ex; aceitar somente quantidades inteiras positivas de MWN; creditar UMS na carteira interna.
- O bloco deve mostrar, no momento da operação, os saldos atuais de UMS interno e MWN da MW-Ex.
- Cada direção possui campo de quantidade independente e validação própria.

### 3.3 Transferência entre usuários

- Bloco separado, sem qualquer campo UMS ou conversão implícita.
- Exibir somente o saldo MWN disponível na MW-Ex como limite de transferência.
- Aceitar apenas quantidade inteira de MWN, maior que zero e menor ou igual ao saldo disponível.
- O backend deve repetir as validações; não confiar em controles HTML ou validação JavaScript.
- Débito e crédito devem ocorrer no mesmo ledger MWN, de forma transacional, idempotente e auditável.

### 3.4 Indivisibilidade de MWN

MWN é unidade inteira. Não existem frações de MWN em conversão, transferência, crédito administrativo, reversão ou lançamento contábil.

- UMS → MWN já exige múltiplos de 1.000 UMS.
- MWN → UMS deve rejeitar quantidades fracionárias.
- MWN_TRANSFER deve rejeitar quantidades fracionárias.
- ADMIN_CREDIT deve rejeitar quantidades fracionárias.
- O armazenamento deve impedir valores atômicos não divisíveis por 1.000.000, correspondentes à escala interna de seis casas por MWN.
- Reversões devem preservar exatamente a quantidade inteira da transação original; não podem introduzir frações.

## 4. Escopo

Incluído:
1. Separação visual e funcional dos blocos de conversão/reconversão e transferência.
2. Exibição dos saldos reais de UMS interno e MWN da MW-Ex no contexto correto.
3. Validação client-side e server-side de quantidades e limites.
4. Restrições no banco para impedir quantidades fracionárias em todos os caminhos de escrita MWN.
5. Extratos MW-Ex e carteira integrada que identifiquem corretamente a natureza MWN, direção, origem, destino, carteiras e transaction ID.
6. Testes de limites, precisão, saldo insuficiente, transferência entre usuários, histórico e regressão.
7. Plano de publicação sequenciado, sem execução automática em produção.

Fora de escopo:
- Alterar tokenomics, relação econômica 1:1.000 ou direitos dos ativos.
- Converter saldos, corrigir ou reescrever lançamentos históricos sem autorização específica.
- Realizar novas transferências reais para teste.
- Aplicar migration em produção, fazer merge ou publicar deploy sem autorização explícita.
- Reabrir o desenho geral da MW-Ex ou realizar refatorações sem relação direta com os critérios desta missão.

## 5. Critérios de aceite

1. O usuário identifica visualmente dois fluxos distintos: conversão/reconversão e transferência MWN entre usuários.
2. O bloco de conversão mostra os saldos atuais de UMS interno e MWN da MW-Ex; cada direção usa seu próprio campo.
3. O bloco de transferência mostra apenas saldo MWN da MW-Ex e aceita apenas inteiros positivos dentro do saldo.
4. Tentativas de enviar 0,1 MWN, zero, valor negativo ou valor acima do saldo são rejeitadas na UI e no backend.
5. As RPCs de transferência, reconversão e crédito administrativo rejeitam MWN fracionário.
6. Restrições de armazenamento impedem inserir quantidades atômicas fracionárias em ledger e transações.
7. O teste de referência com 462 MWN resulta em débito de 462 MWN e crédito de 462 MWN, nunca 4,62.
8. Os extratos mostram a mesma unidade e valor dos lançamentos contábeis, identificando origem/destino e IDs das carteiras.
9. Testes e build passam; a validação visual e o smoke test autenticado são registrados separadamente.
10. A missão permanece aberta enquanto preview, migração, rollout e validação autenticada não forem comprovados.

## 6. Sequência e gates

1. Reconciliar a ocorrência e fixar os invariantes (23.1).
2. Corrigir os blocos e validações da interface (23.2).
3. Reforçar RPCs e restrições de armazenamento (23.3).
4. Completar extratos e rastreabilidade (23.4).
5. Executar testes, build, preview e smoke test autenticado seguro (23.5).
6. Somente após autorização explícita, executar rollout em ordem: PR #23 primeiro; migration no Supabase canônico; depois merge/deploy da PR #24. (23.6)

A PR #24 está vinculada à branch fix/mwex-auditable-statements e é baseada na PR #23, fix/mwn-canonical-quote-wallet. A migration deve estar aplicada antes do frontend que espera os campos ampliados. Nenhum merge, migration ou deploy de produção é autorizado por este Blueprint.

## 7. Fontes canônicas

- MISSION_0021 e governance/missions/0021/BLUEPRINT.md.
- Regra de indivisibilidade MWN já registrada no aditamento 11.4 do Blueprint MISSION_0021.
- Supabase canônico MeshWave65: ufylccbdjfzydbwhpmpp.
- Repositório de implementação: meshwave65/newsite.
- PR #24: https://github.com/meshwave65/newsite/pull/24.
- PR #23 (dependência/base): https://github.com/meshwave65/newsite/pull/23.
- OR-20261112-0066 e Operational Reports subsequentes desta missão.

## 8. Limite de declaração

Código preparado em branch não equivale a código integrado em main. Migration versionada não equivale a migration aplicada. Build READY não equivale a teste visual ou smoke test autenticado. A missão só poderá declarar a correção publicada e validada após evidência específica de cada gate.
