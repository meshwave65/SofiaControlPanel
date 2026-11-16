# MISSION_0026 — Avaliação da Stack Ethereum para MeshWave

**Estado:** STAGED — AGUARDANDO APROVAÇÃO DO TR  
**Prioridade:** CRÍTICA — nível máximo cadastrado no SCP  
**TR atual:** [TR-v0.1.0-DRAFT.md](./TR-v0.1.0-DRAFT.md)  
**Solicitação original:** [ORIGINAL_REQUEST.md](./ORIGINAL_REQUEST.md)

## Objetivo

Determinar, com evidências do estado atual do ecossistema e pesquisa técnica atualizada, se MeshWave deve reaproveitar tecnologias e componentes do ecossistema Ethereum — especialmente EVM, contratos inteligentes, Solidity, padrões de tokens, clientes, bibliotecas, carteiras e infraestrutura — em vez de desenvolver equivalentes próprios.

A análise abrange MWN, UMS, MW-Ex, ledger, carteiras, blockchain/rede MeshWave e PoUW. O resultado deve recomendar o que adotar, integrar, adaptar, manter próprio ou descartar.

## Tese de trabalho

A hipótese prioritária a testar é uma arquitetura híbrida: reaproveitar uma camada madura de execução programável e seus padrões/ferramentas, preservando as regras econômicas MeshWave e investigando PoUW separadamente como mecanismo de contribuição/validação de trabalho útil. Isso é hipótese de investigação, não decisão arquitetural aprovada.

## Regras de início e escopo

- A missão permanece STAGED até aprovação explícita do TR.
- Após a aprovação, produzir Blueprint derivado do TR aprovado antes de executar as tarefas.
- Esta missão é de análise e recomendação; não autoriza implementação, POC executável, migração, transação, deploy, alteração de código, banco, contratos, carteiras, chaves ou configuração.
- Não consumir créditos pagos nem iniciar execução em provedores externos.
- Não presumir que documentos antigos ou snapshots reflitam o estado atual; verificar repositórios, commits, deployments e dados atuais estritamente pertinentes.
- Não transformar a investigação em auditoria geral de todos os projetos MeshWave.
- Não designar agente fixo; o SCP deve permitir atribuição conforme elegibilidade e disponibilidade.
- Preservar a diretriz de validar interesse externo antes de investimento em desenvolvimento além do conceito.

## Requisitos MeshWave que não podem ser perdidos

1. UMS é a unidade econômica interna e permanece segregada por carteira.
2. Transferências diretas entre usuários UMS não são permitidas.
3. A conversão entre UMS e MWN ocorre exclusivamente pela MW-Ex, nos dois sentidos conforme regras aprovadas.
4. MWN é a ponte entre a economia interna e o mercado externo.
5. A MW-Ex deve manter compra e venda, mas somente para ativos explicitamente habilitados; neste momento MWN é o ativo operacional padrão.
6. Crédito/saldo FIAT exige entrada financeira confirmada e registro correspondente no ledger.
7. O ledger deve preservar proveniência, reconciliação, reversões e trilha auditável.
8. PoUW não pode ser tratado como sinônimo de PoW, PoS ou simples recompensa por computação; sua função, verificabilidade e segurança precisam ser demonstradas.

## Continuidade

1. Em nova sessão, ler este README, o TR, TASKS e PROGRESS.
2. Após aprovação do TR, produzir o Blueprint e reconciliar as tarefas com o estado atual dos repositórios e ambientes.
3. Registrar cada etapa com evidências, OR próprio e atualização do índice operacional.
4. Distinguir sempre fato observado, hipótese, recomendação e decisão humana.
5. Encerrar com decisão objetiva: adotar, integrar parcialmente, manter arquitetura atual ou rejeitar a hipótese, acompanhada de plano e gates.

## Estado inicial — 2026-11-16

- Solicitação registrada.
- TR v0.1.0-DRAFT criado; aguardando aprovação humana.
- Blueprint não criado, por depender da aprovação do TR.
- Quadro de tarefas criado.
- Nenhuma inspeção profunda, alteração técnica, POC, transação ou deploy foi executado nesta missão.
