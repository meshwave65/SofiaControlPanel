# MISSION_0024 — Redesign Visual da MW-Ex / Banking Experience

Leia este README, o BLUEPRINT.md, TASKS.md e PROGRESS.md antes de retomar esta missão em outra sessão ou agente.

## Objetivo

Melhorar exclusivamente a apresentação da MW-Ex para que ela tenha aparência e experiência de aplicativo financeiro/bancário profissional. A base funcional atual foi considerada satisfatória pelo responsável; o problema a resolver é a interface visual, sua hierarquia e clareza.

## Escopo

Somente:
- linguagem visual, cores, tipografia, espaçamento e superfícies;
- composição e navegação das telas existentes;
- cards, carteira/patrimônio, mercado, ordens, operações, extratos e estados;
- responsividade e acessibilidade visual;
- ajustes apresentacionais de JSX/CSS sem alterar comportamento.

Não tocar:
- regras de negócio, saldos, ledger, cálculos ou estados financeiros;
- RPCs, APIs, Supabase, banco, migrations, RLS, policies ou grants;
- autenticação, autorização, contratos, rotas ou configuração de deploy;
- migração/segregação de hospedagem;
- novas funcionalidades ou refatorações sem relação direta com estética.

## Direção visual

App-first, premium, profissional e sóbrio. A interface deve priorizar leitura financeira, confiança, clareza e consistência. Evitar excesso de cards, bordas, gradientes, microtextos e aparência de formulário administrativo.

## Estado inicial

- Produto: `meshwave65/newsite`.
- Rota: `/mw-ex`.
- Produção atual: `https://www.meshwave.com.br/mw-ex`.
- A missão começa pela inspeção do estado real do código e pelo diagnóstico visual; não presumir que uma proposta anterior esteja aplicada ou que um Preview protegido tenha sido validado.
- Nenhuma alteração funcional, financeira, de banco ou de produção foi executada na abertura da missão.

## Retomada

1. Ler BLUEPRINT.md, TASKS.md e PROGRESS.md.
2. Conferir a branch/PR e o último commit do produto.
3. Continuar da tarefa não concluída, sem repetir trabalho já evidenciado.
4. Gerar OR por fase concluída e atualizar `governance/operational_reports/INDEX.csv`.
5. Atualizar este PROGRESS.md e o quadro TASKS.md após cada etapa relevante.

## Regra de segurança

Nenhuma transação real deve ser realizada para validar a interface. Não modificar qualquer fluxo financeiro para “facilitar” a apresentação. Se uma mudança visual exigir alteração de comportamento ou contrato, interromper esse ponto e manter o comportamento existente.


## Encerramento — 2026-11-14

**Estado:** DONE — publicada em produção.

- PR #37 merged; PR #35 foi encerrada como branch anterior superada.
- A implementação visual foi publicada em https://www.meshwave.com.br/mw-ex.
- Deploy final: `dpl_CydYBqVoGy6x1xDY2g9oAg4dRbSP` — READY.
- OR de conclusão: [OR-20261114-0015](../../operational_reports/OR-20261114-0015.md).
- O responsável avaliou positivamente o Preview e autorizou o deploy. A QA visual automatizada autenticada não foi possível devido ao login MeshWave.
- A busca de destinatários MWN foi entregue separadamente na MISSION_0021/PR #36 e preservada no deploy final.
- Migração de hospedagem, domínios e segregação de deploys permanecem fora desta missão.
