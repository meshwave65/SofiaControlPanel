# Sofia Control Panel — plano da primeira entrega

## Objetivo
Transformar o repositório atual em um centro de controle para várias contas/agentes Sofia, com cadastro seguro, visão operacional, tarefas e créditos por conta.

## Diagnóstico da base atual
- A interface já possui uma linguagem visual CAD/industrial e páginas de agentes, tarefas e mensagens.
- O commit atual misturou um schema legado (`task_id`, `client_id`, etc.) com o backend e o frontend que usam o schema relacional anterior (`id`, `ownerId`, `statusId`, etc.), causando mais de 100 erros de TypeScript.
- A navegação ainda contém itens placeholder (`Page 1`, `/some-path`).
- A tela de tarefas contém um submit simulado e a tela de mensagens usa dados mockados.
- O cadastro de agentes aceita senha/token, mas o backend não implementa armazenamento seguro nem separação clara entre segredo e dados públicos.
- Não existe fonte confiável para crédito restante; o dashboard atual exibe um valor fixo.

## Entrega desta etapa
1. Reunificar schema, helpers de banco, routers e tipos em torno do modelo funcional anterior.
2. Adicionar campos operacionais de crédito e de conexão ao agente, sem retornar segredos para o cliente.
3. Exibir agentes, estado, conta vinculada, crédito conhecido, tarefa atual e último heartbeat.
4. Corrigir navegação do shell para Dashboard, Agentes, Tarefas e Mensagens.
5. Remover fallback local que esconde falhas do backend e conectar o formulário de tarefas à mutation real.
6. Corrigir a rota de tarefas/detalhes e os erros de tipagem que impedem o build.

## Modelo de integração Manus
A UI deve tratar a conta Manus como uma conexão externa, não como uma senha comum. O fluxo recomendado é:
- preferir OAuth/token oficial, com escopos mínimos e revogação;
- quando a integração exigir segredo, cifrar no servidor usando `CREDENTIAL_ENCRYPTION_KEY`, nunca enviar o valor de volta ao navegador;
- executar login, polling de créditos e tarefas em um worker isolado, com auditoria e rate limit;
- representar ausência de integração como `connectionStatus: not_configured`, sem fingir que o agente está online;
- não automatizar captcha, MFA ou contornar controles da Manus.

## Estrutura
- `drizzle/schema.ts`: entidades e campos persistidos.
- `server/db.ts`: consultas e mutações, incluindo sanitização de agentes.
- `server/routers.ts`: API tRPC protegida por proprietário/admin.
- `client/src/components/DashboardLayout.tsx`: shell e navegação.
- `client/src/pages/Agents.tsx`: cadastro e operação das contas/agentes.
- `client/src/pages/Tasks.tsx` e `TaskDetail.tsx`: fila e acompanhamento.
- `public/manus-routes.json`: manifesto das rotas públicas da aplicação.

## Direção visual
### Alternativas consideradas
- **Console operacional industrial** — 0,06
- **Observatório editorial de agentes** — 0,04
- **Admin minimalista claro** — 0,08

### Escolha: Console operacional industrial
**Movimento:** interface de sala de controle inspirada em CAD técnico, com densidade informacional e sinais de estado legíveis.
**Princípios:** estado antes de decoração; ações reversíveis; densidade em camadas; falhas explícitas.
**Cores:** fundo azul-preto para reduzir fadiga, ciano como sinal de telemetria e âmbar/vermelho apenas para atenção e falha.
**Layout:** shell lateral persistente e conteúdo em painéis assimétricos; a lista de agentes é o centro, com detalhes e tarefa atual sempre próximos.
**Assinaturas:** barras laterais de saúde, identificadores monoespaçados e badges de conexão/crédito.
**Interação:** toda alteração mostra confirmação visual e atualiza a telemetria; ações perigosas exigem confirmação.
**Animação:** pulsos discretos apenas em online/sincronizando; sem animação em excesso.
**Tipografia:** JetBrains Mono para métricas e labels técnicos; hierarquia forte para nomes e estados.
**Essência:** o painel que transforma contas Manus dispersas em uma operação auditável, visível e controlável.
**Voz:** direta e operacional. Exemplos: “Nenhuma conta está conectada.” / “Crédito indisponível — sincronize a conexão.”

## Limites conhecidos
A consulta real de créditos e a execução de tarefas Manus dependem de uma integração oficial autorizada. Nesta etapa a aplicação prepara o contrato de dados e a UI; ela não deve realizar login por senha diretamente nem inventar créditos.
