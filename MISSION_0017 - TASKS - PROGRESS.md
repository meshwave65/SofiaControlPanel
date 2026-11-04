# MISSION_0017 — TASKS — PROGRESS
Missão: Indicação, Onboarding Simplificado e Bonificação UMS
Blueprint: governance/missions/0017/BLUEPRINT.md
Produto: meshwave65/newsite
Atualizado: 2026-11-04

| ID | Tarefa | Status | Instância | Artefato | Próxima ação |
|---|---|---|---|---|---|
| 17.1 | Inspecionar e mapear referências visuais reais da carteira MeshWave para orientar os protótipos da missão | PROGRESS | ChatGPT executor | newsite UI baseline | Localizar componentes, tokens e telas existentes; documentar referência visual sem iniciar lógica |
| 17.2 | Desenhar protótipo da página Admin para configurar percentual por indicador | STAGED | — | newsite UI | Mostrar estrutura, estados e edição; nenhuma persistência nesta etapa |
| 17.3 | Desenhar protótipo do painel do indicador com link pessoal e chamada para compartilhar | STAGED | — | newsite UI | Usar padrão visual da carteira; link demonstrativo sem lógica |
| 17.4 | Desenhar onboarding de indicação com indicador, percentual e campos básicos | STAGED | — | newsite UI | Estados visuais/validação simulados; sem integração Auth |
| 17.5 | Desenhar fluxo visual pós-cadastro e página de aquisição com estimativa base/bonificação | STAGED | — | newsite UI | Prototipar; respeitar a referência visual da carteira |
| 17.6 | Revisar e aprovar o conjunto de protótipos antes da lógica; depois iniciar arquitetura e implementação | STAGED | — | SCP + newsite | Gate explícito de aprovação do responsável; somente após aprovação avançar a lógica |

## Critérios transversais
- Cada usuário pode gerar/copiar seu link; o onboarding indica o nome do indicador e percentual vigente.
- Campos básicos: nome, email, senha, repetir senha. Outros campos somente se uma exigência real do fluxo for demonstrada.
- Uma atribuição por conta, imutável; sem autoindicação ou atribuição a contas existentes.
- Percentual é definido individualmente por indicador em página da Administração; persistência preferencial em tabela separada do perfil, com trilha/auditoria e acesso restrito. Temporalidade (temporária ou contínua) ainda será decidida; não assumir uma duração fixa. Percentual/regra aplicado fica em snapshot na aquisição.
- Elegibilidade: primeira aquisição cujo depósito é validado; pedido pendente/rejeitado não gera crédito.
- Após validação: aquisição-base para indicado, bônus ao indicado e bônus igual ao indicador. Cada crédito possui débito correspondente Genesis.
- Eventos e lançamentos são idempotentes e reconciliáveis; não duplicar em retry/concor­rência.
- Manter 1 MWN = 1.000 UMS, precisão até 6 casas e UX mobile-first limpa.

| 17.7 | Consolidar padrões visuais e componentes aprovados dos formulários (mobile-first, estados e validação) | STAGED | — | newsite UI | Não alterar a carteira além de reutilizar seus padrões |
| 17.8 | Criar material de divulgação imprimível com QR de indicação e QR educativo secundário sobre UMS/MWN | STAGED | — | newsite + conteúdo público | Após aprovar o visual; confirmar destino educativo oficial; testar QR e reservar uso em locais autorizados |

| 17.9 | Implementar configuração administrativa individual do percentual, persistência segregada e trilha de alterações | STAGED | — | Admin UI + Supabase | Somente após aprovação visual e início formal da etapa de lógica; vigência ainda será definida |


## Ordem de execução — design-first
1. Mapear a UI atual da carteira e construir protótipos visuais de todas as telas envolvidas.
2. Apresentar os protótipos para revisão e ajustar conforme feedback; nenhuma lógica/Auth/schema nesta fase.
3. Com aprovação explícita, consolidar os componentes visuais.
4. Só então executar as tarefas de arquitetura, Supabase, Auth, referral, aquisição e lançamentos contábeis; documentar novo sequenciamento no próximo checkpoint.
