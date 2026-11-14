# MISSION_0024 — Progresso

**Estado:** PROGRESS  
**Criada em:** 2026-11-14  
**Produto:** `meshwave65/newsite`  
**Rota:** `/mw-ex`

## Objetivo persistente

Redesenhar exclusivamente a experiência visual da MW-Ex para padrão de aplicativo financeiro/bancário profissional. A funcionalidade atual é considerada satisfatória; esta missão não reabre o escopo funcional da MISSION_0021.

## Abertura da missão — 2026-11-14

- Missão 0024 criada após decisão explícita do responsável de priorizar somente a melhoria estética.
- Infraestrutura, hospedagem, segregação de deploys, domínio e repositórios ficam fora de escopo.
- O produto continua no ambiente e deploy atuais.
- Escopo limitado a apresentação, layout, navegação visual, tipografia, cores, componentes e responsividade.
- Proibidas alterações em regras financeiras, saldos, ledger, RPCs, APIs, Supabase, migrations, RLS, autenticação ou autorização.
- Nenhuma alteração no produto, banco ou produção foi realizada apenas pela abertura documental desta missão.

## Estado das tarefas

| Tarefa | Estado | Observação |
|---|---|---|
| 24.1 Diagnóstico visual e inventário | PROGRESS | Inspeção inicial do JSX/CSS em andamento; registrar baseline e problemas concretos. |
| 24.2 Direção de arte e sistema visual | STAGED | Depende do diagnóstico 24.1. |
| 24.3 Shell, navegação e carteira | STAGED | Implementação apresentacional. |
| 24.4 Mercado, ordens, operações e atividade | STAGED | Implementação apresentacional, sem lógica/contratos. |
| 24.5 Responsividade e QA visual/regressão | STAGED | Requer Preview e inspeção real. |
| 24.6 Revisão, PR e publicação | STAGED — GATE DE RELEASE | Merge/deploy sujeitos aos gates existentes. |

## Evidência e links

- Produto: https://github.com/meshwave65/newsite
- Produção atual: https://www.meshwave.com.br/mw-ex
- Blueprint: ./BLUEPRINT.md
- Quadro: ./TASKS.md

## Diagnóstico estático inicial — 2026-11-14

Inspecionados `MwEx.jsx`, `MwEx.css`, `MwExPortfolio.jsx` e `MwExAssetStatus.css` no repositório de produto.

Achados preliminares:
- `MwEx.css` contém camadas históricas de overrides e regras repetidas, com risco de inconsistência entre componentes.
- O excesso de painéis escuros, bordas, gradientes e sombras faz as áreas competirem visualmente.
- Rótulos uppercase pequenos e metadados comprimidos prejudicam a hierarquia de leitura.
- Conversão e transferência mantêm apresentação de formulário administrativo.
- Seletores estruturais `:nth-of-type()` controlam posicionamento e tornam o grid frágil.
- Carteira/patrimônio, mercado, ordens, tabela de ativos e atividade precisam compartilhar uma linguagem visual.
- Inspeção estática não substitui baseline em navegador; QA visual desktop/mobile permanece pendente.

Nenhum arquivo de produto foi alterado; nenhuma escrita em Supabase, operação financeira, migration ou deploy foi executada.

## Próximo passo

Concluir baseline visual e inventário; definir a direção de arte e o sistema visual antes da implementação abrangente. A implementação será isolada em branch dedicada e validada em Preview.
