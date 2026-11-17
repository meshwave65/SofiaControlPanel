# Blueprint — MISSION_0027

**Versão:** 0.1.0-DRAFT  
**Estado:** DRAFT — depende de TR VALIDATED  
**Derivado de:** TR-v0.1.0-DRAFT.md  
**Autorização atual:** preparação e avaliação documental; sem implementação ou deploy.

## 1. Princípios de execução

- Reaproveitar código e metodologia existentes antes de desenvolver componentes próprios.
- Skill é a camada de competência/orquestração; Playwright ou outro navegador é o adaptador de execução.
- A skill deve ser independente de fornecedor de LLM e de Claude Code.
- O SCP permanece fonte de governança, atribuição, estado e persistência dos artefatos.
- Não duplicar funcionalidades já oferecidas pelo browser runner ou pelas ferramentas de acessibilidade.
- Não alegar que personas sintéticas substituem testes com participantes humanos.
- Priorizar funcionamento e evidência antes de otimização e apresentação visual.
- Nenhum custo comercial ou execução paga sem autorização explícita.

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
- Avaliar axe-core para verificações WCAG automatizadas.
- Avaliar Lighthouse/Pa11y como complementos, sem duplicar verificações.
- Verificar alternativas que não dependam de serviço hospedado pago.
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
| 1 | 27.1 | TR validado + Blueprint READY | inventário aprovado |
| 2 | 27.2 | TR validado + Blueprint READY | análise do plugin |
| 3 | 27.3 | 27.1 e 27.2 | escolha do motor |
| 4 | 27.4 | 27.3 | contrato da skill |
| 5 | 27.5 | 27.4 e ambiente autorizado | piloto comprovado |
| 6 | 27.6 | 27.5 | cobertura dos sistemas priorizados |
| 7 | 27.7 | 27.6 | decisão final |

## 4. Arquitetura candidata

```
SCP Mission / Operational Task
        |
        v
Mission-specific User Testing Skill
        |
        +-- Persona profiles (JSON)
        +-- Test plan / task scenarios
        +-- Safety policy and scope
        +-- Evidence evaluator / report schema
        |
        v
Browser Adapter (Playwright candidate)
        |
        +-- Chromium
        +-- Desktop / Tablet / Mobile viewport
        +-- Screenshots / traces / network profile
        |
        +-- axe-core accessibility checks
        |
        v
Mission artifacts / Operational Reports
```

A arquitetura acima é hipótese. O WP27.3 deve confirmar se Playwright é o menor caminho funcional e se o SCP consegue invocar o worker sem depender de um computador local.

## 5. Restrições técnicas

- A execução de browser precisa ocorrer em ambiente isolado, com limites de domínio e de ações.
- Credenciais não devem ser copiadas para prompts, relatórios ou screenshots.
- Acesso autenticado exige perfil de teste autorizado; nunca pedir senhas ao usuário no chat.
- Bloquear submissões que possam produzir pagamento, movimentação econômica, envio externo ou alteração irreversível.
- A rede lenta/offline deve ser emulada e identificada no relatório; não presumir que toda métrica de latência seja medida no mesmo nível.
- axe-core automatiza apenas parte dos critérios WCAG; testes manuais continuam necessários.
- A/B com personas sintéticas compara comportamento simulado, não prova significância estatística nem causalidade.

## 6. Critérios globais de conclusão

A missão só será encerrada quando os WPs forem concluídos ou formalmente bloqueados, a solução tiver sido testada em ambiente autorizado, os artefatos estiverem persistidos e a recomendação final distinguir capacidade técnica, limitações e custo operacional.

A conclusão desta missão não autoriza correções ou deploy. Desenvolvimento posterior depende de decisão humana e gate próprio.
