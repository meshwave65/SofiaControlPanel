# Progresso — MISSION_0027

## 2026-11-17 — Registro e avaliação inicial

- Missão MISSION_0027 criada em `sofia.governanceMissions`, status STAGED.
- Sete artefatos iniciais versionados em `governance/missions/0027/`.
- Repositório de governança confirmado: `meshwave65/SofiaControlPanel`.
- Projeto original identificado e inspecionado: `ncklrs/claude-chrome-user-testing`, licença MIT, 25 personas em seis categorias e 75 variantes.
- Confirmado que o acoplamento ao Claude ocorre no adaptador `claude --chrome` e nas operações de navegador fornecidas pela integração Claude Chrome.
- Alternativa técnica inicial selecionada para avaliação: Playwright + axe-core, com Lighthouse CI como complemento.
- Verificado que o SCP atual usa `server/manusExecutionService.ts` para criar tarefas via API Manus; não foi identificado adaptador Playwright nativo no orquestrador.
- Verificado que o repositório SOFIA contém `engine/backend/skills.csv`, `personas.csv` e `persona_skills.csv` legados, mas não um diretório operacional `engine/skills/` no branch principal consultado.
- O banco atual contém 8 registros genéricos em `public.skills`, 6 papéis de agentes em `public.personas` e 9 associações em `public.persona_skills`; não correspondem às personas de UX do plugin e não estão mapeados no schema Drizzle nem usados por `server/db.ts` do SCP.
- As três tabelas públicas estão com RLS desabilitado e permitem SELECT a `anon` e `authenticated`. O conteúdo atual é metadado genérico; revisar a política antes de adicionar instruções ou perfis privados. Nenhuma alteração de RLS/grants foi feita.
- Render confirma `SofiaControlPanel-web` ativo no plano Free e informa sua URL pública; a leitura da página não foi possível pelo navegador web disponível. Interface e fluxo autenticado permanecem sem teste interativo.
- A tentativa de iniciar automação via TinyFish não foi executada porque o saldo disponível estava negativo. Nenhum crédito foi adicionado nem serviço pago contratado.
- A tentativa de criar tarefa operacional STAGED foi rejeitada pelo guard do banco: exige TR VALIDATED e Blueprint READY derivado da versão mais recente. Nenhuma tarefa operacional foi criada por essa tentativa.
- Nenhum agente foi despachado; nenhum crédito Manus foi consumido; nenhum sistema foi alterado.

## Conclusão preliminar

A implementação é tecnicamente viável sem Claude. Não é necessário procurar outro plugin fechado: reaproveitar a metodologia MIT e trocar o adaptador por Playwright é a rota de menor complexidade aparente. A lacuna real é integrar a skill ao runtime atual do SCP e disponibilizar um Browser Worker isolado, com persistência de evidências na missão.

## Próximas ações

1. Revisão e validação humana do TR v0.1.0.
2. Atualizar Blueprint para READY somente após TR validado.
3. Criar tarefa operacional raiz vinculada explicitamente a MISSION_0027 pelo fluxo autorizado do SCP.
4. Iniciar WP27.1 e WP27.2 em paralelo, se houver agentes elegíveis.
5. Confirmar se o worker Playwright pode ser executado em infraestrutura existente sem custo adicional; não contratar serviços.
