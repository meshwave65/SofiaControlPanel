# Solicitação original — MISSION_0026

**Título:** Avaliação Estratégica e Técnica de Reaproveitamento da Stack Ethereum no Ecossistema MeshWave  
**Solicitante:** Responsável pelo produto  
**Data de registro:** 2026-11-16  
**Prioridade:** CRÍTICA — nível máximo disponível no SCP  
**Estado:** STAGED — aguardando aprovação do TR

## Solicitação

Após assistir a um histórico sobre Ethereum, o responsável identificou semelhanças relevantes entre a visão do ecossistema MeshWave e conceitos implementados no universo Ethereum, incluindo blockchain programável, contratos inteligentes, ativos digitais e mecanismos de consenso/mineração. Também levantou a possibilidade de reaproveitar tecnologias maduras do ecossistema Ethereum — especialmente EVM, Solidity, padrões de tokens, bibliotecas, clientes e infraestrutura — em vez de construir componentes equivalentes do zero.

Solicita-se uma análise estratégica e técnica prioritária para determinar o que MeshWave deve adotar, integrar, adaptar, manter próprio ou descartar, considerando MWN, UMS, MW-Ex, PoUW, carteiras, ledger, rede e demais componentes do ecossistema.

## Intenção central

Não reconstruir aquilo que já existe de forma madura, segura, auditável e economicamente vantajosa. Reaproveitar componentes comprovados sempre que isso reduzir tempo, custo, risco e código proprietário, sem sacrificar as regras econômicas e arquiteturais próprias da MeshWave.

## Diretrizes obrigatórias

- Tratar semelhanças conceituais como contexto de pesquisa e análise de anterioridade, não como prova de plágio ou de originalidade.
- Distinguir Bitcoin (lançado em 2009) de Ethereum (proposto em 2013 e lançado em 2015).
- Distinguir a camada de execução programável (EVM/contratos) da camada de consenso. Ethereum substituiu PoW por PoS em 15/09/2022; isso não equivale a implementar PoUW.
- Avaliar PoUW como hipótese própria da MeshWave, sem presumir que seja substituto direto de PoW/PoS nem que trabalho útil, por si só, forneça consenso seguro.
- Preservar como requisitos a separação entre UMS e MWN, a ausência de transferências diretas entre carteiras UMS, a conversão exclusiva UMS↔MWN via MW-Ex, o controle de ativos efetivamente negociáveis e a integridade do ledger.
- Não presumir que o código, a blockchain, os contratos ou os mecanismos descritos em documentos antigos estejam atuais ou operacionais. Confirmar tudo em repositórios e ambientes atuais.
- Não iniciar desenvolvimento, POC executável, migração, transação, deploy ou alteração de código/dados/configuração nesta missão.
- Qualquer implementação ou POC deverá ser objeto de decisão posterior, com gate próprio e observância da diretriz do responsável de validar interesse externo antes de investir em desenvolvimento além do conceito.

## Resultado esperado

Uma recomendação fundamentada de arquitetura — incluindo o que reaproveitar, integrar, adaptar, manter próprio ou abandonar — e um plano de decisão por fases, com riscos, custos, dependências, evidências e critérios de go/no-go.
