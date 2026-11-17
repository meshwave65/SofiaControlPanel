# MISSION_0027 — Auditoria de Experiência do Usuário e Usabilidade dos Sistemas MeshWave

**Estado:** STAGED — missão registrada no SCP; TR em DRAFT  
**Prioridade proposta:** ALTA  
**Solicitação original:** [ORIGINAL_REQUEST.md](./ORIGINAL_REQUEST.md)  
**Termo de Referência:** [TR-v0.1.0-DRAFT.md](./TR-v0.1.0-DRAFT.md)  
**Blueprint:** [BLUEPRINT.md](./BLUEPRINT.md)  
**Tarefas:** [TASKS.md](./TASKS.md)  
**Progresso:** [PROGRESS.md](./PROGRESS.md)

## Objetivo

Avaliar a experiência de uso das interfaces dos sistemas MeshWave/SOFIA por meio de testes automatizados orientados por personas e evidências de navegação, e determinar a forma mais simples e sustentável de incorporar essa capacidade ao SCP como skill independente de Claude Code.

## Decisão técnica a investigar

A hipótese inicial é reutilizar o projeto original como fonte de metodologia e dados de personas, não como runtime. A automação pode ser desacoplada por meio de um adaptador de navegador baseado em Playwright, com execução em worker controlado pela SOFIA. Para acessibilidade automatizada, avaliar axe-core; para auditorias complementares, Lighthouse/Pa11y.

Essa é uma hipótese de implementação, ainda não uma decisão aprovada. A missão deve comparar alternativas, dependências, custo operacional, segurança e compatibilidade com os agentes/SCP.

## Escopo inicial

1. Inventariar as interfaces web ativas e priorizar os sistemas por criticidade e uso.
2. Usar o SCP como primeiro candidato de piloto, sem limitar a missão a ele.
3. Avaliar o plugin `ncklrs/claude-chrome-user-testing`, sua licença, estrutura, personas, comandos e dependências.
4. Verificar alternativas de automação sem Claude Code e sem contratação de serviço pago.
5. Especificar uma skill modular que os agentes possam carregar por missão, combinando apenas as competências necessárias.
6. Testar fluxos críticos em ambiente autorizado, com dados sintéticos e sem efeitos financeiros ou persistentes em produção.
7. Entregar relatório com evidências, severidade, personas afetadas, reprodução e recomendação de correção.

## Regras

- Não usar Claude Code nem `claude --chrome` como dependência.
- Não contratar nem consumir créditos de serviços de automação pagos.
- Não fixar agente; o SCP deve permitir atribuição dinâmica conforme elegibilidade.
- Não alterar código, dados, configurações ou deploys durante a fase de auditoria.
- Não submeter pagamentos, ordens, transferências, cadastros reais ou mensagens externas.
- Testes de formulário com payloads de segurança somente em ambiente isolado e autorizado.
- Distinguir achados automatizados, inferências da persona e evidência humana.
- Nenhuma correção de produto está autorizada por esta missão; recomendações e eventual implementação devem passar por gate próprio.
- Não considerar documentação histórica como estado atual sem validação no sistema ativo.

## Critério de sucesso

A missão deve demonstrar se a skill pode executar testes reais de interface por meio de navegador automatizado sob orquestração do SCP, persistir rastros e relatórios na missão, e produzir resultados reproduzíveis sem dependência de Claude Code ou serviço pago.
