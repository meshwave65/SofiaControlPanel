# MISSION_0026 — Avaliação da Stack Ethereum para MeshWave

**Estado:** PROGRESS — TR aprovado, Blueprint READY e missão operacional liberada  
**Prioridade:** CRÍTICA — nível máximo cadastrado no SCP  
**TR aprovado:** [TR-v0.1.0-APPROVED.md](./TR-v0.1.0-APPROVED.md)  
**Blueprint:** [BLUEPRINT.md](./BLUEPRINT.md)  
**Solicitação original:** [ORIGINAL_REQUEST.md](./ORIGINAL_REQUEST.md)  
**Tarefa operacional:** [SCP-TASK-000027](../../missions/SCP-TASK-000027.md)

## Objetivo

Determinar, com evidências atuais do ecossistema, se MeshWave deve reaproveitar tecnologias maduras do universo Ethereum — especialmente EVM, Solidity, padrões de contratos, clientes, bibliotecas, carteiras, indexadores e infraestrutura — em vez de desenvolver equivalentes próprios.

A análise abrange MWN, UMS, MW-Ex, ledger, carteiras, blockchain/rede MeshWave e PoUW. O resultado deve recomendar o que adotar, integrar, adaptar, manter próprio, substituir ou não utilizar.

## Tese de trabalho

A hipótese prioritária a testar é uma arquitetura híbrida: reaproveitar uma camada madura de execução programável e seus padrões/ferramentas, preservando as regras econômicas MeshWave e investigando PoUW separadamente. Isso é hipótese de investigação, não decisão arquitetural aprovada.

## Regras de início e escopo

- O TR v0.1.0 foi aprovado explicitamente pelo responsável em 2026-11-16.
- O Blueprint v1.0.0 foi derivado do TR aprovado e está READY.
- A tarefa operacional SCP-TASK-000027 foi liberada em prioridade CRÍTICA.
- A missão é de análise e recomendação; não autoriza implementação, POC executável, migração, transação ou deploy.
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

1. Em nova sessão, ler este README, o TR aprovado, BLUEPRINT, TASKS e PROGRESS.
2. Executar os work packages na ordem e dependências do Blueprint.
3. Registrar cada unidade com OR próprio, evidências e atualização do índice operacional.
4. Distinguir sempre fato observado, hipótese, recomendação e decisão humana.
5. Encerrar com decisão objetiva: adotar, integrar parcialmente, manter arquitetura atual ou rejeitar a hipótese, acompanhada de plano e gates.

## Segurança e RLS

A tabela `sofia."governanceMissions"` estava com RLS desabilitado. Foi corrigida por migração dedicada:
- RLS habilitado.
- Política restritiva para `anon` e `authenticated` nega todas as operações.
- Nenhum grant de acesso direto foi concedido a esses papéis.
- Acesso administrativo/backend existente não foi ampliado nem removido.
- Nenhuma outra tabela, política ou grant foi alterado.

A política é intencionalmente fechada até que exista um desenho de acesso mínimo necessário para a interface. A missão não deve tornar a tabela diretamente acessível a todos os usuários.

## Estado — 2026-11-16

- Solicitação original preservada.
- TR v0.1.0 aprovado e registrado como VALIDATED.
- Blueprint v1.0.0 criado e registrado como READY, derivado da versão aprovada do TR.
- RLS de governanceMissions corrigido.
- Tarefa operacional SCP-TASK-000027 criada em prioridade CRÍTICA.
- Nenhuma implementação Ethereum, contrato, token, carteira, transação ou POC foi iniciada.
