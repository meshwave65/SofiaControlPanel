# Blueprint — MISSION_0027

**Versão:** 1.0.0  
**Estado:** READY  
**Derivado de:** TR-v0.1.0-APPROVED.md (VALIDATED em 2026-11-17)  
**Autorização:** execução da missão aprovada pelo responsável em 2026-11-17, dentro dos limites do TR.

## 1. Princípios de execução

- Reaproveitar código e metodologia existentes antes de desenvolver componentes próprios.
- Skill é a camada de competência/orquestração; Playwright é o adaptador candidato de execução do navegador.
- A skill deve ser independente de fornecedor de LLM e de Claude Code.
- O SCP permanece fonte de governança, atribuição, estado e persistência dos artefatos.
- Não duplicar funcionalidades já oferecidas pelo browser runner ou pelas ferramentas de acessibilidade.
- Não alegar que personas sintéticas substituem testes com participantes humanos.
- Priorizar funcionamento e evidência antes de otimização e apresentação visual.
- Não consumir créditos pagos, contratar serviços ou exceder a infraestrutura gratuita existente.
- Não executar ações que produzam efeitos persistentes ou financeiros nos sistemas auditados.

## 2. Work packages

### WP27.1 — Inventário dos sistemas e interfaces
- Identificar aplicações web ativas nos serviços MeshWave.
- Registrar URL, função, criticidade, estado de deploy e existência de ambiente de teste.
- Priorizar fluxos que podem ser testados sem autenticação privilegiada ou efeitos persistentes.
- Primeiro candidato: interface pública do SofiaControlPanel.
**Saída:** inventário com prioridades e restrições.

### WP27.2 — Auditoria do projeto original
- Ler README, SKILL.md, catálogo de personas, comandos, agentes e licenças.
- Identificar componentes independentes do Claude e dependências acopladas ao Claude Chrome.
- Mapear quais arquivos/dados de persona podem ser reutilizados.
**Saída:** matriz REUTILIZAR / ADAPTAR / DESCARTAR.

### WP27.3 — Comparação de motores e ferramentas
- Avaliar Playwright como motor open-source de browser automation.
- Avaliar integração com o runtime de agentes e o mecanismo de skills do SCP.
- Avaliar axe-core para verificações WCAG.
- Avaliar Lighthouse CI como complemento, sem duplicar verificações.
- Confirmar execução em infraestrutura existente/gratuita sem serviço pago.
**Saída:** decisão técnica com custo, execução, limitações e manutenção.

### WP27.4 — Desenho da skill nativa
- Estruturar diretório de skill com instruções, personas, playbooks, schemas e formatos de relatório.
- Separar perfil da persona, plano de teste, adaptador de browser e avaliador de evidências.
- Permitir compor uma skill específica da missão a partir de competências de várias skills existentes.
- Definir interface para agentes: alvo, persona(s), viewport(s), tarefas, limites de segurança e saída.
**Saída:** especificação da skill e contrato de execução.

### WP27.5 — Piloto controlado
- Usar ambiente de teste ou interface pública autorizada.
- Executar pelo menos uma persona de baixa familiaridade e uma persona digital-native.
- Capturar screenshot, trace, tempos e resultado de tarefa.
- Executar varredura axe e percurso por teclado.
- Confirmar persistência dos artefatos na missão.
**Saída:** prova de viabilidade não destrutiva.

### WP27.6 — Auditoria dos sistemas priorizados
- Expandir testes para os sistemas aprovados no inventário.
- Executar matriz de personas, viewports e fluxos críticos.
- Testar formulários apenas com dados sintéticos e sem efeitos reais.
- Comparar variantes A/B quando existirem URLs distintas.
**Saída:** relatórios por sistema e matriz consolidada de achados.

### WP27.7 — Síntese e recomendação
- Consolidar problemas por severidade e recorrência entre personas.
- Separar falha funcional, problema de usabilidade, barreira de acessibilidade e hipótese.
- Estimar custo operacional e esforço de manutenção.
- Recomendar implementação nativa, integração de ferramenta existente ou não adoção.
**Saída:** relatório final e decisão submetida ao responsável.

## 3. Sequência e dependências

| Ordem | WP | Dependência | Gate |
|---|---|---|---|
| 1 | 27.1 | TR VALIDATED + Blueprint READY | inventário aprovado |
| 2 | 27.2 | TR VALIDATED + Blueprint READY | análise do plugin |
| 3 | 27.3 | 27.1 e 27.2 | escolha do motor |
| 4 | 27.4 | 27.3 | contrato da skill |
| 5 | 27.5 | 27.4 e ambiente autorizado | piloto comprovado |
| 6 | 27.6 | 27.5 | cobertura dos sistemas priorizados |
| 7 | 27.7 | 27.6 | decisão final |

## 4. Arquitetura de referência

```
SCP Mission / Operational Task
        |
        v
Mission-specific User Testing Skill
  - persona profiles (JSON)
  - task scenarios and timing
  - safety policy and scope
  - evidence evaluator / report schema
        |
        v
Browser Worker (Playwright candidate)
  - isolated browser context
  - desktop / tablet / mobile viewport
  - screenshots / traces / console / network
        |
        +---- axe-core accessibility checks
        +---- Lighthouse CI (complementary)
        |
        v
Mission artifacts / Operational Reports
```

A integração com o runtime e a escolha final do local de execução serão demonstradas nos WPs 27.3–27.5. Não presumir que um serviço Render gratuito suporta browser headless sem validar limites de memória, armazenamento efêmero e tempo de execução.

## 5. Restrições técnicas e de segurança

- A execução de browser precisa ocorrer em ambiente isolado, com allowlist de domínios e limites de ações.
- Credenciais não devem ser copiadas para prompts, relatórios ou screenshots.
- Acesso autenticado exige perfil de teste autorizado; nunca pedir senhas ao usuário no chat.
- Bloquear submissões que possam produzir pagamento, movimentação econômica, envio externo ou alteração irreversível.
- A rede lenta/offline deve ser emulada e identificada no relatório.
- axe-core automatiza apenas parte dos critérios WCAG; testes manuais continuam necessários.
- A/B com personas sintéticas compara comportamento simulado, não prova significância estatística nem causalidade.
- Testes de formulário com fuzzing somente em staging isolado e com payloads não destrutivos.
- Nenhum serviço pago, crédito Manus/TinyFish ou recurso comercial será usado nesta autorização.

## 6. Critérios globais de conclusão

A missão só será encerrada quando os WPs forem concluídos ou formalmente bloqueados, a solução tiver sido testada em ambiente autorizado, os artefatos estiverem persistidos e a recomendação final distinguir capacidade técnica, limitações e custo operacional.

Esta missão autoriza auditoria, desenho técnico e piloto não destrutivo. Não autoriza correções de produto, alterações de produção ou deploy. Desenvolvimento posterior depende de decisão humana e gate próprio.
