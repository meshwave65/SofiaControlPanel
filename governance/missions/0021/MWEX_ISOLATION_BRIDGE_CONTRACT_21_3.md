# MISSION_0021 / Tarefa 21.3 — Contrato de isolamento, ledgers e ponte UMS↔MWN

**Projeto:** Projeto Triangulo / SofiaControlPanel / MeshWave  
**E-mail do usuário Manus:** 2.15080907e+08+meshwave65@users.noreply.github.com  
**Data e hora:** 10/11/2026, 09:22 (-03:00)  
**Estado:** SPECIFICATION_CHECKPOINT  
**Dependências:** `MWEX_STATE_INVENTORY_21_1.md`; `MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md`

## 1. Finalidade

Este contrato define os limites que uma futura implementação da MW-Ex deve obedecer. Ele não cria tabelas, RPCs, saldos, carteiras, permissões ou transações. Qualquer implementação que não consiga provar os controles abaixo deve permanecer bloqueada em sandbox.

## 2. Domínios contábeis separados

### 2.1 Carteira interna UMS

- Unidade: UMS efetivo, com a precisão normativa aprovada.
- Fonte de saldo: ledger UMS da carteira interna.
- Escopo: utilidade/serviço interno.
- Não pode ler um saldo MWN para calcular UMS disponível.
- Não pode creditar UMS por uma transferência MWN sem evento de ponte concluído.

### 2.2 Carteira MW-Ex

- Unidade: MWN efetivo no ledger próprio da MW-Ex.
- Fonte de saldo: somente ledger MWN da MW-Ex.
- Escopo: manter e transferir MWN e solicitar conversões explicitamente.
- Não pode derivar saldo corrente de `mw_account_ledger` UMS, de aquisições legadas ou de saldo visual calculado.
- Deve guardar histórico próprio por carteira, com eventos imutáveis ou append-only.

### 2.3 Registro de ponte

A ponte não é um saldo compartilhado. É um registro de transações que relaciona dois domínios por eventos pareados e auditáveis. Cada lado mantém sua própria entrada contábil; a ponte registra a correlação, o estado e a reconciliação.

## 3. Autorização MeshWalker-only

A autorização deve ser aplicada em camadas, com negação por padrão:

1. **Sessão:** token autenticado e não expirado.
2. **Elegibilidade:** perfil/registro canônico MeshWalker ativo e elegível, verificado no servidor; não confiar em flag enviada pelo browser.
3. **Estado da carteira:** carteira MW-Ex ativa, não bloqueada, vinculada ao `auth.uid()` correto.
4. **Ação:** política separada para leitura, transferência, conversão e administração.
5. **RLS/serviço:** as tabelas e funções devem revalidar o ator e impedir leitura/escrita lateral.
6. **Administração:** privilégios administrativos não concedem acesso para movimentar saldo de usuário sem fluxo, motivo, autorização e trilha própria.

Sem confirmação da fonte canônica de elegibilidade, a rota deve mostrar indisponível/bloqueada, não liberar operação por ser apenas autenticada.

## 4. Modelo mínimo de entidades

Nomes são contratuais e podem ser adaptados ao schema aprovado; não devem ser criados sem revisão de implementação.

- `mwex_wallets`: `wallet_id`, `owner_user_id`, `status`, `created_at`, `updated_at`, `version`.
- `mwex_ledger_entries`: `entry_id`, `wallet_id`, `asset='MWN'`, `amount_atomic`, `entry_type`, `transaction_id`, `created_at`, `reversal_of`.
- `mwex_transactions`: `transaction_id`, `idempotency_key`, `actor_user_id`, `kind`, `status`, `source_wallet_id`, `destination_wallet_id`, `created_at`, `completed_at`, `failure_code`.
- `mwex_bridge_operations`: `bridge_id`, `transaction_id`, `from_domain`, `to_domain`, `from_asset`, `to_asset`, `from_amount_atomic`, `to_amount_atomic`, `ratio_version`, `state`, `actor_user_id`, `created_at`, `completed_at`, `rollback_of`.
- `mwex_reconciliation_runs`: `run_id`, `scope`, `started_at`, `completed_at`, `status`, `exception_count`, `report_uri/hash`.

Todos os IDs devem ser únicos; valores monetários devem ser inteiros atômicos/decimal controlado, nunca `float`.

## 5. Contrato de ponte

### 5.1 Entrada

Uma solicitação deve conter, no mínimo:

- `idempotency_key` criada pelo cliente e validada no servidor;
- ator autenticado;
- carteira origem e destino;
- domínio/ativo origem e destino;
- quantidade atômica origem;
- `ratio_version` e regra de precisão;
- motivo/tipo (`UMS_TO_MWN` ou `MWN_TO_UMS`);
- nonce/versão esperada quando houver concorrência;
- timestamp recebido e expiração da solicitação.

O servidor nunca deve aceitar carteira ou proprietário apenas por texto enviado pelo cliente sem resolver e verificar a relação com `auth.uid()`.

### 5.2 Estados

`REQUESTED → AUTHORIZED → RESERVED → POSTED_SOURCE → POSTED_DESTINATION → COMPLETED`.

Estados de erro:

- `REJECTED`: rejeição antes de reserva;
- `EXPIRED`: janela de validade encerrada;
- `FAILED`: erro técnico sem confirmação de conclusão;
- `ROLLBACK_REQUIRED`: origem/destino não puderam ser concluídos juntos;
- `ROLLED_BACK`: compensação confirmada, com referência ao evento original.

Nenhuma operação pode ser apresentada como concluída enquanto os dois lados não estiverem reconciliados.

### 5.3 Atomicidade e recuperação

- Preferir uma transação de banco com bloqueios de linha/versão e constraint de idempotência.
- Se os domínios estiverem em sistemas distintos, usar saga com reserva, confirmação, timeout e compensação explícita; nunca crédito implícito.
- Repetir a mesma `idempotency_key` deve devolver o resultado original.
- Duas operações concorrentes não podem gastar a mesma reserva.
- Falha depois do débito exige destino confirmado ou rollback observável; não deixar estado intermediário silencioso.
- Eventos de compensação não apagam o histórico original.

## 6. Invariantes obrigatórios

1. Cada saldo é a soma de entradas do seu próprio ledger.
2. Nenhuma entrada MWN aparece no ledger UMS e nenhuma entrada UMS aparece no ledger MWN, salvo registros explícitos no registro de ponte.
3. Uma operação concluída tem exatamente uma unidade de débito e crédito por domínio, conforme o tipo.
4. Soma de créditos e débitos atômicos da operação é zero em cada domínio afetado.
5. Relação aplicada e escala ficam gravadas; não usar a configuração corrente para reinterpretar o passado.
6. Uma chave de idempotência não pode concluir duas vezes.
7. Reversão sempre referencia o evento original e não altera o evento histórico.
8. Um usuário só lê sua carteira e seus eventos, além de cotações públicas aprovadas.
9. Admin não pode escolher arbitrariamente `owner_user_id` para contornar autorização.
10. Nenhuma conversão cria MWN/UMS sem uma origem contábil autorizada.

## 7. Controles de consulta e UI

- A UI deve receber um DTO filtrado pelo servidor; não consultar tabelas sensíveis diretamente para montar o saldo MWN.
- A resposta deve indicar `wallet_status`, `balance_mwn`, `potential_ums`, `potential_ums_disclaimer` e estado de cotação sem transformar potencial em disponibilidade.
- Histórico deve limitar-se à carteira do usuário e omitir documentos fiscais, comprovantes e dados de outros participantes.
- Destinatário deve ser resolvido por identificador seguro; não listar usuários elegíveis indiscriminadamente.
- Rotas administrativas e endpoints de bridge não devem ser expostos à interface comum.

## 8. Reconciliação

Uma rotina read-only deve comparar periodicamente:

- soma do ledger MWN versus saldo materializado, se houver;
- soma do ledger UMS versus saldo efetivo da carteira interna;
- ponte concluída versus pares de entradas nos dois ledgers;
- operações em estados intermediários além do TTL;
- idempotency keys repetidas ou divergentes;
- relação/precisão gravadas versus regra vigente;
- eventos de rollback sem origem ou com compensação incompleta.

Qualquer exceção bloqueia nova operação real no escopo afetado até triagem e registro. Reconciliação não deve “corrigir” saldo automaticamente sem evento autorizado.

## 9. Matriz de acesso

| Ator | Ler própria MWN | Transferir própria MWN | Converter | Ler outra carteira | Operação administrativa |
|---|---:|---:|---:|---:|---:|
| Usuário autenticado não elegível | Não | Não | Não | Não | Não |
| MeshWalker elegível | Sim | Sim, limites | Sim, após gates | Não | Não |
| Suporte/admin | Somente escopo autorizado e auditado | Não por atalho | Não por atalho | Somente necessidade operacional | Motivo + trilha + aprovação |
| Serviço de reconciliação | Dados mínimos read-only | Não | Não | Não fora do escopo | Relatório, não mutação |
| Job de ponte | Somente transações autorizadas | Executa contrato | Executa contrato | Não | Sem privilégio geral |

## 10. O que permanece bloqueado

- Criar schema/RPC em produção.
- Reutilizar `mw_account_ledger` UMS como ledger MWN.
- Derivar saldo MWN operacional de UMS.
- Liberar rota apenas porque existe sessão.
- Migrar Genesis ou retirar aquisição normal de UMS.
- Executar preço, ordem, depósito, saque ou transferência real.
- Dar privilégio de serviço ao browser ou expor segredo.

## 11. Handoff

A tarefa 21.4 poderá implementar uma razão MW-Ex apenas em fixture/sandbox autorizada e depois em ambiente aprovado, usando este contrato. Antes de qualquer operação real, 21.7 deve testar todos os invariantes, concorrência, idempotência, falha parcial e autorização; 21.8 deve fechar readiness, Genesis e rollback.

## 12. Aditamento — nomenclatura, domínio fiat e ponte para ativos externos (2026-11-11)

Este aditamento complementa o contrato e prevalece sobre definições anteriores incompatíveis. Não cria schema, RPC, saldo, integração ou autorização de produção.

### 12.1 Nomenclatura oficial e identificadores legados

- O ativo vigente chama-se **MWN — MeshWave Network**.
- **MWC** é denominação histórica/legada de “MeshWave Cripto”, abandonada após a identificação de outro token em circulação com essa sigla.
- Identificadores existentes com o prefixo/símbolo mwc em tabelas, colunas/campos, variáveis, módulos, serviços e no simulador mwc-bm51.onrender.com são legados. Não representam um ativo separado.
- Novos contratos, documentação, interfaces e conceitos usam MWN. Migração de nomes técnicos não é automática: requer inventário de dependências, compatibilidade, plano reversível, estratégia de dados e aprovação.

### 12.2 Domínios e rota de conversão

A separação contábil UMS/MWN permanece obrigatória. Para operações que envolvam ativos externos, o contrato deve reconhecer também o domínio de saldo/liquidação fiat e a posição/ordem do ativo externo, sem fundir seus ledgers.

Rota obrigatória para aquisição de ativo externo com recursos originados em UMS:

**UMS → MWN → moeda fiduciária → ativo/token externo.**

Não são permitidas arestas diretas UMS→fiat ou UMS→ativo externo. A etapa MWN→fiat é uma operação própria da MW-Ex, com preço, contraparte, custos, limites, estado e evidência de liquidação. A compra externa usa o saldo fiat resultante e registra ordem, execução, ativo recebido, preço, fonte/contraparte, timestamps, taxas e reconciliação.

O mecanismo existente de aquisição de UMS usando moeda fiduciária permanece distinto e permitido; não deve ser confundido com conversão reversa UMS→fiat.

### 12.3 Modos de origem dos recursos

A solicitação de ordem deve persistir o modo escolhido:
- UMS_ONLY;
- FIAT_ONLY;
- HYBRID_FIAT_FIRST — fiat primeiro, complemento por UMS→MWN→fiat;
- HYBRID_UMS_FIRST — UMS primeiro, complemento fiat; a parcela UMS percorre UMS→MWN→fiat.

A escolha define a prioridade de consumo, não uma conversão direta. O sistema deve registrar por perna os ativos, quantidades, taxa/versão, preço, custos, contraparte, estado e referências correlacionadas. A execução só pode ser declarada concluída após liquidação e reconciliação de todas as pernas.

### 12.4 Precisão, taxas e histórico

- MWN é inteiro e não admite frações.
- O truncamento para baixo e a exibição sem casas decimais aplicam-se somente à apresentação na interface; nunca modificam o ledger.
- UMS mantém internamente toda a precisão contábil existente, mesmo que a UI o apresente sem casas decimais.
- A relação de referência atual é 1.000 UMS = 1 MWN. Deve ser configurável e versionada; cada transação guarda a versão aplicada, e alterações futuras não reinterpretam o histórico.
- Conversões para MWN inteiro não podem descartar resíduos UMS. A regra exata para conversão parcial e manutenção do resíduo deve ser formalizada antes de ativar a operação.
- Taxas atuais de corretagem/administrativas são zero. Se criadas, devem ser cobradas em UMS na carteira interna, nunca deduzidas do saldo MWN ou fiat da MW-Ex.

### 12.5 Invariantes adicionais

1. Nenhum débito UMS é finalizado sem MWN correspondente creditado, ou compensação/rollback integral e auditável.
2. Nenhuma ordem externa financiada por UMS contorna a sequência UMS→MWN→fiat→ativo.
3. A prioridade híbrida é registrada antes da execução e aplicada de forma determinística; insuficiência ou falha em qualquer perna cancela ou compensa a operação conforme política aprovada.
4. Saldos UMS, MWN e fiat permanecem contabilmente segregados; a correlação entre eles é feita por operações/eventos auditáveis.
5. A aquisição de UMS com fiat não autoriza conversão de UMS de volta para fiat.
6. Nenhuma integração externa, depósito/saque, custódia ou execução real é autorizada por este documento; requer desenho, controles, conformidade e aprovação próprios.
