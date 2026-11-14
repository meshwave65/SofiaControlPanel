# MISSION_0024 — Quadro de tarefas

**Estado:** DONE — PUBLICADA EM PRODUÇÃO  
**Missão de referência:** MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma  
**Regra:** cada fase concluída deve produzir OR próprio; mudanças exclusivamente apresentacionais.

| ID | Tarefa | Estado | Responsável | Dependência | Saída/critério |
|---|---|---|---|---|---|
| 24.1 | Diagnóstico visual e inventário dos componentes | DONE | ChatGPT / agente SCP | MISSION_0021 e código atual | Diagnóstico estático concluído; direção visual avaliada pelo responsável no Preview. OR-20261114-0012/0013/0015. |
| 24.2 | Definir direção de arte e sistema visual | DONE | ChatGPT / agente SCP | 24.1 | Sistema visual bancário premium em `src/pages/MwExBanking.css`. |
| 24.3 | Redesenhar shell, navegação e carteira/patrimônio | DONE | ChatGPT / agente SCP | 24.2 | Composição app-first e carteira integradas. |
| 24.4 | Redesenhar mercado, ordens, operações, atividade e estados | DONE | ChatGPT / agente SCP | 24.2, 24.3 | Linguagem visual unificada, sem alterações funcionais. |
| 24.5 | Responsividade, acessibilidade visual e QA de regressão | DONE — ACEITE DO RESPONSÁVEL | ChatGPT / agente SCP | 24.3, 24.4 | Breakpoints, foco e redução de movimento implementados; Preview avaliado positivamente pelo responsável. QA automatizada autenticada permaneceu bloqueada pelo login MeshWave. |
| 24.6 | Revisão final, PR e publicação controlada | DONE | ChatGPT / agente SCP | 24.5 | PR #37 merged; deploy final `dpl_CydYBqVoGy6x1xDY2g9oAg4dRbSP` READY. OR-20261114-0015. |

## Regras de execução

- Alterações limitadas a CSS e estrutura apresentacional JSX.
- Não alterar handlers, hooks de estado, chamadas Supabase, RPCs, APIs, cálculos, regras, dados, rotas ou permissões.
- Não criar funcionalidades nem remover controles existentes.
- Não executar transações reais durante testes.
- Não migrar hospedagem nem modificar projetos/domínios/configurações Vercel ou Render.
- Build READY não substitui QA visual.

## Encerramento — 2026-11-14

A missão foi concluída após merge da PR #37 e publicação em produção. O responsável aceitou a direção visual no Preview. A inspeção automatizada autenticada não foi possível devido ao login MeshWave; isso fica registrado como limitação de QA, não como pendência de implementação.

