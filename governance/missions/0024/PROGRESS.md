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
| 24.1 Diagnóstico visual e inventário | PROGRESS | Inspeção estática concluída; baseline autenticada e inspeção de estados desktop/mobile pendentes por barreira de login. OR-0012/0013. |
| 24.2 Direção de arte e sistema visual | DONE (primeira versão) | Sistema visual bancário premium implementado em `MwExBanking.css`: superfícies claras, tipografia, paleta, estados, espaçamento e componentes. Sujeito a refinamento após inspeção autenticada. |
| 24.3 Shell, navegação e carteira | PROGRESS | Primeira composição responsiva e carteira consolidada implementadas; inspeção visual autenticada pendente. |
| 24.4 Mercado, ordens, operações e atividade | PROGRESS | Primeira camada visual aplicada a mercado, ticket, conversão, transferência, tabelas e atividade; sem alteração de lógica/contratos. |
| 24.5 Responsividade e QA visual/regressão | PROGRESS — BLOQUEIO DE AUTENTICAÇÃO | Build Preview READY; a rota redireciona para login MeshWave, sem sessão autenticada disponível para inspeção. Responsividade foi implementada em CSS, mas QA visual real permanece pendente. |
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

## Implementação inicial — 2026-11-14

- Branch: `feat/mission-0024-mwex-banking-redesign`
- PR: https://github.com/meshwave65/newsite/pull/35
- Preview: https://newsite-8sksz644a-meshwaves-projects.vercel.app/mw-ex
- Deployment: `dpl_EouYQWx3vnb8jrMS8cx2TcBybRUU` — READY
- Commit do Preview: `7ca6d13d1bce75bb5086870b68572929db63b939`
- Arquivo visual consolidado: `src/pages/MwExBanking.css`
- Imports antigos de `MwEx.css`, `MwExAssetStatus.css` e `MwExPortfolio.css` removidos dos componentes MW-Ex para evitar cascata concorrente. Os arquivos antigos permanecem no repositório, mas não são carregados por estes componentes.
- Alteração em JSX limitada a imports de CSS; nenhum hook, handler, chamada, regra ou conteúdo funcional alterado.
- Diff do PR: dois arquivos finais alterados (um JSX com imports e um CSS novo); nenhuma alteração em banco, API, RPC, auth ou deploy de produção.
- Build Vite executado no Preview: 208 módulos transformados; deployment READY.
- Inspeção de navegador confirmou que o Preview ultrapassa a proteção Vercel por link temporário, mas a rota `/mw-ex` exige autenticação MeshWave e redireciona a `/login`. Sem sessão MeshWalker, QA visual autenticada não foi possível.
- Link temporário de acesso Vercel expira em 2026-11-15; o link com token não é armazenado nos artefatos públicos de governança.

## Próximo passo

Inspeção visual autenticada do Preview em desktop e mobile; validar hierarquia, legibilidade, estados e ausência de overflow. Ajustar a apresentação conforme evidência e somente então concluir 24.1/24.3/24.4/24.5. Não fazer merge ou deploy de produção antes desse gate.
