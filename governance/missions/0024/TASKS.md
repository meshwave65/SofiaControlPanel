# MISSION_0024 — Quadro de tarefas

**Estado:** PROGRESS  
**Missão de referência:** MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma  
**Regra:** cada fase concluída deve produzir OR próprio; mudanças exclusivamente apresentacionais.

| ID | Tarefa | Estado | Responsável | Dependência | Saída/critério |
|---|---|---|---|---|---|
| 24.1 | Diagnóstico visual e inventário dos componentes | PROGRESS | ChatGPT / agente SCP | MISSION_0021 e código atual | Inspeção estática inicial concluída; baseline autenticada e inspeção de estados ainda pendentes. OR-20261114-0012/0013. |
| 24.2 | Definir direção de arte e sistema visual | DONE (primeira versão) | ChatGPT / agente SCP | 24.1 | Sistema visual implementado em `src/pages/MwExBanking.css`; refinamento final depende de QA visual. |
| 24.3 | Redesenhar shell, navegação e carteira/patrimônio | PROGRESS | ChatGPT / agente SCP | 24.2 | Primeira composição e carteira implementadas; inspeção autenticada pendente. |
| 24.4 | Redesenhar mercado, ordens, operações, atividade e estados | PROGRESS | ChatGPT / agente SCP | 24.2, 24.3 | Primeira camada visual aplicada; sem alterações de lógica ou contratos. |
| 24.5 | Responsividade, acessibilidade visual e QA de regressão | PROGRESS — AUTH GATE | ChatGPT / agente SCP | 24.3, 24.4 | Build Preview READY; inspeção autenticada desktop/mobile bloqueada por login MeshWave. |
| 24.6 | Revisão final, PR e publicação controlada | STAGED — GATE DE RELEASE | — | 24.5 | Diff dentro do escopo, PR revisada, Preview inspecionado; release conforme autorização/gates vigentes. |

## Regras de execução

- Alterações limitadas a CSS e estrutura apresentacional JSX.
- Não alterar handlers, hooks de estado, chamadas Supabase, RPCs, APIs, cálculos, regras, dados, rotas ou permissões.
- Não criar funcionalidades nem remover controles existentes.
- Não executar transações reais durante testes.
- Não migrar hospedagem nem modificar projetos/domínios/configurações Vercel ou Render.
- Build READY não substitui QA visual.
