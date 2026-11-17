# Termo de Referência — MISSION_0027

**Versão:** 0.1.0-DRAFT  
**Estado:** DRAFT — requer validação humana  
**Missão:** Auditoria de Experiência do Usuário e Usabilidade dos Sistemas MeshWave

## 1. Pergunta central

A SOFIA/SCP consegue executar, de forma autônoma e rastreável, testes automatizados de experiência de uso orientados por personas em nossas interfaces web, sem Claude Code e sem contratação de serviços pagos?

## 2. Objetivos específicos

- Determinar o que pode ser reaproveitado do repositório original.
- Avaliar a viabilidade de Playwright como motor de navegação e interação.
- Avaliar axe-core e ferramentas complementares para WCAG.
- Projetar personas e tempos de reação como perfis de execução parametrizados.
- Testar fluxos em desktop, tablet e mobile.
- Testar formulários, erros, recuperação, abandono e caminhos críticos.
- Comparar duas variantes de uma interface por meio de tarefas e métricas equivalentes.
- Registrar screenshots, traces, tempos, eventos e resultados em artefatos da missão.
- Recomendar integração mínima ao diretório de skills e ao mecanismo de despacho do SCP.

## 3. Escopo funcional mínimo

1. **Personas:** biblioteca de pelo menos 25 perfis importados/adaptados quando licenciados e relevantes; permitir personas específicas da MeshWave.
2. **Comportamento:** velocidade de leitura, hesitação, confiança de clique, persistência, recuperação de erro, tolerância a espera e gatilhos de frustração.
3. **Tarefas:** roteiro com objetivo, pré-condições, passos observáveis e critério de conclusão.
4. **Navegador:** abrir páginas, localizar elementos, clicar, digitar, navegar, rolar, capturar screenshots e traces.
5. **Viewports:** desktop, tablet e mobile; emulação de toque quando suportada.
6. **Rede:** avaliar conectividade normal, lenta e offline, registrando limitações do mecanismo utilizado.
7. **Acessibilidade:** varredura automatizada com axe-core ou alternativa; teclado/foco/labels/contraste e revisão manual onde automação não for conclusiva.
8. **Formulários:** campos obrigatórios, validação, mensagens, máscaras, estados de erro e recuperação. Fuzzing de segurança apenas em ambiente isolado.
9. **A/B:** executar o mesmo roteiro e perfil em duas URLs/variantes e comparar resultados; não inferir causalidade estatística com amostra sintética.
10. **Relatório:** achados por severidade, evidência, timestamp, tarefa, persona, viewport, reprodução e recomendação.

## 4. Métricas e evidências

- taxa de conclusão por tarefa;
- tempo total e tempo por etapa;
- erros, tentativas, retornos e abandonos;
- tempo de espera percebido/simulado;
- pontos de hesitação e gatilhos de frustração;
- cobertura de elementos e fluxos;
- violações automatizadas WCAG/axe, com regra e evidência;
- screenshots e Playwright traces;
- diferença entre variantes A/B, com limitações explícitas.

Os tempos de reação são parâmetros de simulação, não medições de pessoas reais. O relatório deve evitar falsa precisão e indicar a natureza sintética dos resultados.

## 5. Fora de escopo e salvaguardas

- testes de carga/estresse em produção;
- transações financeiras, pagamentos, ordens, transferências ou alterações econômicas;
- criação de contas reais, envio de e-mails, SMS ou mensagens;
- exploração de vulnerabilidades em sistemas de terceiros;
- alteração de código, schema, políticas, dados ou configurações de produção;
- implantação de workers, contratação de serviços ou consumo de créditos pagos;
- correção automática de problemas encontrados.

## 6. Critérios de aceite

- inventário de interfaces e priorização baseado em evidências atuais;
- avaliação documentada do plugin original e de alternativas;
- demonstração técnica em ambiente autorizado de navegação real, captura de evidências e execução de pelo menos um roteiro;
- teste em viewport mobile e desktop;
- varredura WCAG automatizada com limitações documentadas;
- relatório reproduzível e persistido na missão;
- arquitetura de skill compatível com agentes do SCP e sem dependência do Claude Code;
- custo operacional e dependências explicitados;
- recomendação final: implementar, adaptar ferramenta existente ou rejeitar a abordagem, com justificativa.

## 7. Gate

Este documento está em DRAFT. A criação da tarefa operacional e o início de execução formal dependem da validação humana deste TR e da publicação de Blueprint READY derivado da versão validada. Nenhum agente deve contornar esse gate.
