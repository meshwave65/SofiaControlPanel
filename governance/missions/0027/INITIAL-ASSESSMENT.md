# Avaliação inicial de viabilidade — MISSION_0027

**Data:** 2026-11-17  
**Estado:** análise preliminar; não substitui os WPs da missão.

## 1. Projeto original

Repositório: https://github.com/ncklrs/claude-chrome-user-testing  
Licença declarada no repositório: MIT.

A documentação consultada confirma:
- 25 personas distribuídas em seis categorias, com três variantes de gênero por persona (75 perfis/variantes);
- perfis de comportamento, leitura, confiança de clique, recuperação de erro, rolagem, preenchimento, paciência e tolerância de carregamento;
- simulação de pausas, confusão, tentativas de recuperação e possível abandono;
- testes multi-persona, A/B, desktop/tablet/mobile, rede lenta/offline e exportação de traces;
- módulos adicionais de WCAG, cookies/GDPR/CCPA, fuzzing de formulários, checkout Stripe e integração com GitHub PR;
- comandos específicos para smoke test, critical path, checagem de links e criação de personas.

O acoplamento ao Claude está no adaptador de navegador: o SKILL.md exige `claude --chrome` e utiliza operações `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type` e `browser_take_screenshot`. O uso de traces Playwright não significa que o runtime já seja independente do Claude.

Arquivos de referência:
- README: https://github.com/ncklrs/claude-chrome-user-testing/blob/main/README.md
- Skill principal: https://github.com/ncklrs/claude-chrome-user-testing/blob/main/skills/user-testing/SKILL.md
- Personas: https://github.com/ncklrs/claude-chrome-user-testing/blob/main/docs/personas.md
- WCAG: https://github.com/ncklrs/claude-chrome-user-testing/blob/main/skills/wcag-auditor/SKILL.md
- Form fuzzer: https://github.com/ncklrs/claude-chrome-user-testing/blob/main/skills/form-fuzzer/SKILL.md

## 2. Alternativa técnica identificada

A alternativa mais direta é substituir somente o adaptador de navegador e manter o modelo de personas/roteiros:

- **Playwright:** motor open-source para automação real de Chromium, Firefox e WebKit; contextos isolados; emulação de dispositivos; screenshots, traces e execução offline.
- **axe-core:** motor open-source de auditoria automatizada de acessibilidade; sua documentação informa cobertura média de cerca de 57% dos problemas WCAG automatizáveis e marca casos inconclusivos para revisão manual.
- **Lighthouse CI:** complemento para desempenho, acessibilidade, boas práticas e comparação de resultados entre versões.

Referências oficiais:
- https://playwright.dev/
- https://playwright.dev/docs/emulation
- https://github.com/microsoft/playwright
- https://github.com/dequelabs/axe-core
- https://github.com/GoogleChrome/lighthouse-ci

Playwright oferece emulação nativa de viewport/dispositivo e modo offline. Perfis de rede específicos como slow-3g/fast-3g exigem configuração complementar (CDP ou proxy/controle de rede), a confirmar no piloto.

## 3. Estado atual da SOFIA/SCP

### Evidências positivas
- O SCP possui registro de governança `sofia.governanceMissions` e tarefas operacionais `sofia.tasks`.
- O repositório `meshwave65/SofiaControlPanel` possui orquestração de tarefas, documentos de missão, gates de execução e sincronização GitHub.
- O serviço web público do SCP respondeu e apresentou a tela pública de entrada.
- O repositório `meshwave65/sofia` mantém arquivos legados `engine/backend/skills.csv`, `personas.csv` e `persona_skills.csv`.

### Lacunas confirmadas
- As tabelas legadas `public.skills`, `public.personas` e `public.persona_skills` estão com RLS desabilitado; os papéis `anon` e `authenticated` possuem privilégio SELECT. Os registros atuais são metadados genéricos, mas a exposição deve ser revisada antes de inserir perfis ou instruções privadas. Esta missão não alterou RLS nem grants.
- O código atual do SCP cria tarefas Manus por meio de `server/manusExecutionService.ts`; o orquestrador atual não expõe um adaptador genérico Playwright.
- O runtime principal atual está acoplado ao despacho de tarefas para a API Manus. Uma skill textual, sozinha, não cria capacidade de controle de navegador.
- O repositório SOFIA na branch principal não apresenta diretório operacional `skills/` em `engine/`; os CSVs existentes são legado e não comprovam um carregador de skills ativo.
- No banco atual, `public.skills` contém 8 competências genéricas, `public.personas` contém 6 papéis de agentes (Executor, Escriba, RH, Worker, Condenser e Oracle) e `public.persona_skills` contém 9 associações. Não são as 25 personas de UX do plugin. O schema Drizzle atual do SCP não mapeia essas tabelas e `server/db.ts` não as utiliza; portanto, o catálogo existe no banco, mas não está integrado ao runtime atual do painel.
- A página pública do SCP foi inspecionada, mas o fluxo autenticado e as telas internas não foram testados.

## 4. Arquitetura candidata para independência do Claude

```
SCP / MISSION_0027 / tarefa operacional
        |
        v
Skill de missão: user-testing
  - personas JSON
  - plano e critérios de tarefa
  - comportamento/temporização
  - política de segurança
  - avaliadores e esquema de relatório
        |
        v
Browser Worker HTTP (Playwright)
  - Chromium (primeiro piloto)
  - contextos isolados por persona
  - viewport mobile/tablet/desktop
  - screenshots, trace, console e rede
  - modo offline e rede condicionada
        |
        +---- axe-core (WCAG automatizado)
        +---- Lighthouse CI (auditoria complementar)
        |
        v
Artefatos da missão / Operational Reports
```

A skill orienta o agente e compõe competências. O Browser Worker executa as ações determinísticas. Essa separação evita que a skill fique presa a um fornecedor de LLM ou a uma extensão de navegador específica.

O worker pode ser um serviço isolado no Render ou um job de CI controlado pelo SCP. A escolha depende do teste de compatibilidade, memória, tempo de inicialização e limites gratuitos. O código das ferramentas é open-source, mas a computação e a hospedagem podem consumir cotas de infraestrutura; não presumir custo zero antes de medir.

## 5. Composição recomendada da skill

Reaproveitar/adaptar:
1. `user-testing`: personas, timing, comportamentos e relatório.
2. `wcag-auditor`: critérios e playbooks de acessibilidade, com axe-core como verificador automatizado.
3. `form-fuzzer`: somente payloads controlados em staging/ambiente isolado.
4. `cookie-auditor`: opcional, se o sistema usar consentimento/cookies e houver base regulatória pertinente.
5. A lógica A/B e viewport da documentação de comandos.

Não incorporar no primeiro MVP:
- `stripe-checkout` e qualquer submissão de pagamento;
- comentários automáticos em PR;
- fuzzing agressivo ou teste de segurança em produção;
- mais de um motor de navegador no primeiro piloto, salvo necessidade comprovada.

As personas devem priorizar características comportamentais e necessidades de acesso/contexto. Idade, gênero ou nacionalidade não devem ser tratados como determinantes automáticos de comportamento. Personas sintéticas são cenários de teste, não usuários reais nem amostra estatística.

## 6. Limitações metodológicas obrigatórias

- A simulação de leitura, hesitação, cliques e frustração é sintética; não prova comportamento humano real.
- A/B com personas sintéticas é comparação de execução controlada, não experimento estatístico com usuários.
- axe-core não certifica conformidade WCAG completa. Testes com teclado, leitor de tela real, zoom, contraste contextual e revisão humana continuam necessários.
- Form fuzzing pode criar dados, disparar WAF ou alterar estado; limitar a staging e contas descartáveis.
- Testes de login exigem credenciais de teste autorizadas; nunca armazenar credenciais em prompts ou relatórios.

## 7. Resultado preliminar

**Conclusão:** tecnicamente viável. Não é necessário procurar outro plugin fechado. A melhor rota é adaptar a metodologia MIT do projeto original e substituir o acoplamento Claude Chrome por Playwright, com axe-core e Lighthouse CI como componentes especializados.

**Lacuna principal:** o SCP ainda não possui integração ativa de skills com um Browser Worker independente. É necessário implementar o carregador/contrato de skill e o adaptador de execução, sem alterar o fluxo de agentes existente até que a arquitetura seja aprovada.

**Bloqueio formal:** a tentativa de criar a tarefa operacional STAGED foi recusada pelo guard do banco, que exige TR VALIDATED e Blueprint READY derivado da versão vigente. A tentativa não criou registro operacional. Não contornar o gate.

**Execução prática:** nenhuma navegação autenticada ou interação de browser foi realizada. O executor de browser externo disponível para teste não iniciou por indisponibilidade de saldo; nenhum crédito foi comprado ou consumido. O próximo piloto deve usar Playwright em runtime controlado e sem serviço pago.
