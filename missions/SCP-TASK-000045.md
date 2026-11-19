# Projeto de lançamento do mercado MWN com cashback

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000045 |
| taskId | 45 |
| source | SofiaControlPanel interface |
| creator | meshwave65@gmail.com |
| creatorType | user |
| statusId | 3 |
| priorityId | 1 |
| parentTaskId |  |
| dueDate |  |
| mirroredAt | 2026-11-19T12:51:46.416Z |

## Description

Projeto derivado da missão SCP-TASK-000044 — Governança de mercado do MWN no MW-Ex. Sua execução depende da conclusão e publicação da linha de base de governança da missão 000044; não redefinir nem contradizer suas regras sem decisão explícita do operador.

Objetivo: transformar o lançamento do mercado MWN com cashback em um projeto real de implementação, com estratégia de lançamento, desenho de incentivos, sustentabilidade econômica, arquitetura técnica/operacional e implantação faseada.

Escopo a estudar e propor:
- estratégia de entrada e ativação do mercado primário e secundário;
- parâmetros de cashback (taxas, duração, elegibilidade, limites, redução gradual), sem tratá-los como decididos;
- origem de funding e dimensionamento de reservas de FIAT/cashback;
- regras de oferta, ordens, reserva de MWN, matching, agregação e liquidação coerentes com a governança da missão 000044;
- custos, riscos e sustentabilidade após redução dos incentivos;
- arquitetura técnica e operacional, controles, auditoria, antifraude e métricas;
- plano de implantação por fases, testes, critérios de prontidão e gates de autorização.

Limites: nesta fase não executar transações, não publicar ordens reais, não movimentar FIAT/MWN, não alterar saldos, carteiras ou ledger, não emitir tokens, não implementar em produção, não comprometer funding nem prometer cashback. Qualquer implementação ou operação financeira exige decisão e autorização próprias.

Método: construir primeiro um plano fundamentado e evolutivo; registrar opções, premissas, custos, riscos e decisões pendentes. A missão é dependente da 000044 e não deve iniciar execução antes de a governança-base estar concluída e disponível.

## Synchronization contract

- Supabase task ID: `45`
- GitHub path: `missions/SCP-TASK-000045.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
