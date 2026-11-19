# Governança de mercado do MWN no MW-Ex

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000044 |
| taskId | 44 |
| source | SofiaControlPanel interface |
| creator | meshwave65@gmail.com |
| creatorType | user |
| statusId | 4 |
| priorityId | 1 |
| parentTaskId |  |
| dueDate |  |
| mirroredAt | 2026-11-19T12:51:43.478Z |

## Description

Consolidar e formalizar como versão evolutiva 0.1 o modelo atual de governança do mercado MWN no MW-Ex, preservando fielmente os conceitos desenvolvidos pelo operador. O registro deve distinguir decisões já estabelecidas de questões ainda abertas, sem exigir precisão técnica exaustiva ou auditoria prévia para produzir uma linha de base útil.

MODELO ATUAL A REGISTRAR

1. PREÇO, ESTOQUE, OFERTA, DEMANDA E LIQUIDEZ
- Distinguir estoque total de MWN de oferta efetiva. Uma grande posição em MWN não constitui oferta se o detentor não pretende vender.
- O preço de mercado é o preço marginal da negociação executada, e não uma função direta do estoque total.
- Uma negociação marginal não comprova profundidade de liquidez para volumes maiores.
- Ausência de negociação ou de contraparte executável não significa matematicamente preço zero; significa ausência de preço executável naquele momento.
- Manter distintos estoque, oferta efetiva, demanda, liquidez e preço marginal.

2. MERCADO PRIMÁRIO E SECUNDÁRIO
- Primário: MeshWave vende MWN de seu próprio estoque e recebe o valor da venda.
- Secundário: um MeshWalker vende MWN a outro MeshWalker; o vendedor recebe integralmente o valor da venda. A MeshWave não recebe o valor da venda apenas por operar a plataforma.

3. CASHBACK E RESPONSABILIDADE DO VENDEDOR
- Cashback é liquidado separadamente do pagamento da compra.
- O vendedor recebe integralmente o preço de venda; somente o comprador recebe o cashback.
- O cashback é financiado pelo próprio vendedor que o oferece.
- Exemplo: MeshWave vende MWN por R$ 2,00 com cashback de 10%; recebe R$ 2,00 e paga R$ 0,20 ao comprador. Fluxo líquido de caixa de +R$ 1,80 antes de custos e do valor econômico/custo dos MWN entregues; isso não deve ser automaticamente chamado de lucro.
- No mercado secundário, o cashback é financiado pelo saldo FIAT do próprio MeshWalker vendedor; não presumir subsídio da MeshWave.
- Cashback pode ser incentivo transitório. Taxa e duração são decisões estratégicas, não promessa de retorno permanente nem de valorização.
- Com o crescimento do mercado secundário, a MeshWave poderá reduzir ou suspender seus subsídios. Avaliar atividade independente, recorrência de compradores e vendedores, profundidade, spreads, impacto de preço e atividade após redução de incentivos; não usar apenas volume bruto como prova de sustentabilidade.

4. RESERVAS, ORDENS E LIQUIDAÇÃO
- Qualquer vendedor, MeshWalker ou MeshWave, pode oferecer cashback.
- Antes de publicar uma ordem com cashback, o vendedor deve possuir saldo FIAT suficiente e reservá-lo.
- A quantidade de MWN ofertada também deve ser reservada.
- Reservas FIAT e MWN por ordem não podem ser comprometidas em duplicidade.
- Execuções parciais devem liquidar pagamento, entrega de MWN e cashback como uma única liquidação lógica atômica.
- No cancelamento, liberar somente as reservas correspondentes à quantidade não executada.
- Preservar internamente identidade do vendedor, MWN reservados, valor e reserva de cashback, timestamp, quantidade executada e remanescente, origem MeshWalker/MeshWave e trilha de auditoria.

5. LIBERDADE DE ESCOLHA DO COMPRADOR E PREFERÊNCIA DE EXECUÇÃO
- O comprador escolhe livremente as condições comerciais; não presumir que cashback maior é sempre preferível.
- Exemplo: o comprador pode escolher uma oferta com 9% de cashback em vez de outra com 10%, por motivo que o sistema não precisa conhecer.
- A preferência de governança só atua quando as condições comerciais são equivalentes.
- Ofertas com condições diferentes são ofertas distintas; cabe ao comprador decidir.
- A equivalência deve considerar termos materiais, como preço, cashback, ativo/moeda de liquidação, prazo, taxas, restrições e possibilidade de execução parcial. Detalhes ainda não definidos ficam como questões abertas, sem impedir o registro da linha de base.
- Ofertas com termos comerciais idênticos podem ser agregadas na visualização do mercado, sem expor ao comprador a identidade dos vendedores.
- O mecanismo de matching mantém as identidades e prioriza ordens de MeshWalkers sobre ordens da MeshWave somente quando as condições forem equivalentes.
- Exemplo: 1.000 MWN de MeshWalkers e 1.000 MWN da MeshWave, ambos a R$ 2,00 e 10% de cashback, aparecem como oferta agregada de 2.000 MWN. Uma compra de 600 MWN consome primeiro 600 MWN de MeshWalkers; uma compra de 1.500 MWN consome 1.000 MWN de MeshWalkers e 500 MWN da MeshWave.
- Não introduzir prioridade automática por menor preço ou maior cashback entre ofertas com condições distintas: o comprador escolhe entre elas.
- Princípio orientador: “Neutralidade comercial com preferência comunitária”.

LIMITES
Esta missão formaliza a governança conceitual e documental. Não autoriza implementação de código, alteração de banco, ordens reais, movimentação financeira, emissão, conversão, transferência, crédito ou débito de saldos. Não definir por inferência taxas, prazos, funding, limites ou parâmetros ainda não decididos.

MÉTODO
Registrar primeiro uma versão 0.1 fiel e utilizável; separar decisões atuais de questões abertas; depois usar, observar e evoluir o documento com rastreabilidade. Não bloquear a linha de base por busca de perfeição técnica ou auditoria exaustiva.

## Synchronization contract

- Supabase task ID: `44`
- GitHub path: `missions/SCP-TASK-000044.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
