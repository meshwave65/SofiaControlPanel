# MISSION_0024 — Progresso

**Estado:** DONE — PUBLICADA EM PRODUÇÃO  
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
| 24.1 Diagnóstico visual e inventário | DONE | Inspeção estática concluída e direção visual apresentada ao responsável. O acesso automatizado à rota autenticada foi bloqueado pelo login MeshWave. OR-0012/0013/0015. |
| 24.2 Direção de arte e sistema visual | DONE | Sistema visual bancário premium implementado em `MwExBanking.css`. |
| 24.3 Shell, navegação e carteira | DONE | Composição app-first e carteira/patrimônio integradas no sistema visual consolidado. |
| 24.4 Mercado, ordens, operações e atividade | DONE | Mercado, ticket, conversão, transferência, tabelas e atividade receberam a linguagem visual unificada, sem alterações funcionais. |
| 24.5 Responsividade e QA visual/regressão | DONE — ACEITE DO RESPONSÁVEL | Breakpoints desktop/tablet/mobile, foco visível e redução de movimento implementados. O responsável avaliou positivamente o Preview e autorizou a publicação; QA automatizada autenticada não foi possível por barreira de login. |
| 24.6 Revisão, PR e publicação | DONE | PR #37 merged; produção Vercel READY no deployment final `dpl_CydYBqVoGy6x1xDY2g9oAg4dRbSP`. OR-20261114-0015. |

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

## Implementação inicial — 2026-11-14

- Branch: `feat/mission-0024-mwex-banking-redesign`
- PR: https://github.com/meshwave65/newsite/pull/35
- Preview: https://newsite-8sksz644a-meshwaves-projects.vercel.app/mw-ex
- Deployment: `dpl_EouYQWx3vnb8jrMS8cx2TcBybRUU` — READY
- Commit do Preview: `7ca6d13d1bce75bb5086870b68572929db63b939`
- Arquivo visual consolidado: `src/pages/MwExBanking.css`
- Imports antigos de `MwEx.css`, `MwExAssetStatus.css` e `MwExPortfolio.css` removidos dos componentes MW-Ex para evitar cascata concorrente. Os arquivos antigos permanecem no repositório, mas não são carregados por estes componentes.
- Alteração em JSX limitada a imports de CSS; nenhum hook, handler, chamada, regra ou conteúdo funcional alterado.
- Diff do PR: três arquivos finais alterados (dois JSX com ajustes de imports CSS e um CSS novo); nenhuma alteração em banco, API, RPC, auth ou deploy de produção.
- Build Vite executado no Preview: 208 módulos transformados; deployment READY.
- Inspeção de navegador confirmou que o Preview ultrapassa a proteção Vercel por link temporário, mas a rota `/mw-ex` exige autenticação MeshWave e redireciona a `/login`. Sem sessão MeshWalker, QA visual autenticada não foi possível.
- Link temporário de acesso Vercel expira em 2026-11-15; o link com token não é armazenado nos artefatos públicos de governança.

## Encerramento — 2026-11-14

- PR #35 foi encerrada como branch antiga; a implementação visual foi reaplicada sobre a main atual pela PR #37.
- PR #37: https://github.com/meshwave65/newsite/pull/37 — MERGED.
- Commit visual: `71fc929e63731a9b621879045db4bc263e2f5c27`.
- PR #36 integrou separadamente a busca de destinatários MWN por nome/CPF/NIF antes do redesign; a funcionalidade foi preservada no deploy visual.
- PR #38 sincronizou o nome do arquivo de migration com a versão aplicada no Supabase; não alterou o conteúdo SQL.
- Deploy final de produção: `dpl_CydYBqVoGy6x1xDY2g9oAg4dRbSP` — READY, commit `1acc0b7df9db5cfe25de854bd299fc1e1fd41a11`.
- Rota: https://www.meshwave.com.br/mw-ex.
- Build Vite: 209 módulos transformados em 3,54 s. Warning não bloqueante de bundle JS de 746,34 kB acima do limite de 500 kB.
- Nenhuma regra financeira, saldo, ledger, RPC, API, migration de regra de negócio ou operação financeira foi alterada pela PR visual.
- A QA visual automatizada autenticada não foi possível porque a rota exige login MeshWave; o responsável avaliou positivamente o Preview e autorizou o deploy.
- A missão 0024 está encerrada. Migração de hospedagem, domínio, segregação de deploys e outras mudanças de infraestrutura continuam fora do escopo.

OR final: [OR-20261114-0015](../../operational_reports/OR-20261114-0015.md).
