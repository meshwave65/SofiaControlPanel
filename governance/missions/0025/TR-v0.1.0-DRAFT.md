# TR — MISSION_0025
## Cadastro Público Protegido e Isolamento Multiusuário do SCP

**Versão:** 0.1.0-DRAFT  
**Estado:** AWAITING_HUMAN_VALIDATION  
**Criado em:** 2026-11-16  
**Execução autorizada:** NÃO  
**Gate de início:** aprovação explícita deste TR pelo responsável

## 1. Objetivo operacional

Permitir que novos usuários criem conta no SofiaControlPanel sem convite individual, protegendo o serviço contra abuso automatizado e garantindo isolamento efetivo entre os espaços de trabalho dos usuários.

A missão só será considerada concluída quando o cadastro protegido e a segregação forem funcionais e validados no SCP, não apenas descritos em documentação.

## 2. Resultado esperado

1. Cadastro público habilitado sem depender de códigos de convite.
2. Proteção contra bots e abuso de criação de contas, usando mecanismos compatíveis com o fluxo de autenticação existente.
3. Cada usuário acessa somente seus próprios agentes, missões, tarefas, arquivos e artefatos.
4. Administradores autorizados mantêm visão global, sem conceder esse privilégio a usuários comuns.
5. O provisionamento de uma conta prepara seu espaço lógico de trabalho de forma consistente e repetível.
6. Os recursos compartilhados do SCP não expõem dados entre usuários.

## 3. Escopo proposto

### 3.1 Cadastro e prevenção de abuso
- Identificar o fluxo real de autenticação e cadastro já utilizado pelo SCP.
- Habilitar cadastro sem convite, caso não exista uma dependência técnica ou de segurança que impeça isso.
- Aplicar verificação de identidade/e-mail conforme suporte do provedor atual.
- Adicionar proteção anti-bot e limitação de frequência no ponto efetivo de cadastro.
- Definir limites iniciais razoáveis para criação de agentes/missões, uploads e consumo de recursos, sem criar um sistema complexo de planos nesta missão.

### 3.2 Isolamento de dados
- Verificar e corrigir o enforcement de ownership no backend e no banco para agentes, missões/tarefas, logs, arquivos e artefatos.
- Garantir que filtros da interface não sejam tratados como mecanismo de segurança.
- Preservar acesso administrativo global somente para papéis autorizados.
- Proteger credenciais e segredos de agentes contra exposição a outros usuários ou ao cliente.

### 3.3 Provisionamento de espaço
- Criar ou associar um workspace próprio a cada usuário.
- Registrar no banco a relação entre usuário e workspace.
- Usar, como proposta inicial, um bucket privado compartilhado do SCP com prefixo por workspace/usuário no Storage.
- Usar, como proposta inicial, o repositório central privado do SCP para documentos versionáveis, organizados por workspace e acessados somente pelo backend. Não conceder acesso direto ao repositório central aos usuários.
- Não criar bucket ou repositório individual por usuário, salvo se a inspeção demonstrar necessidade concreta e o responsável aprovar a mudança.
- Tornar o provisionamento idempotente: repetição ou retomada não deve duplicar espaços nem corromper dados.

## 4. Limites e exclusões

- Não redesenhar a arquitetura geral do SCP.
- Não migrar de Supabase, GitHub ou Render.
- Não criar microserviços, filas, workers ou serviços externos novos sem necessidade comprovada.
- Não refatorar módulos não relacionados ao cadastro, isolamento ou provisionamento.
- Não alterar o funcionamento de missões/agentes além do necessário para aplicar ownership e segregação.
- Não implementar billing, marketplace, tiers comerciais ou sistema de reputação nesta missão.
- Não copiar credenciais, tokens ou dados sensíveis para GitHub.
- Não alterar produção sem os gates de validação e autorização já exigidos pelo projeto.

## 5. Sequência mínima proposta

1. **Confirmação técnica focada:** inspecionar o fluxo de signup, as tabelas e os caminhos de acesso envolvidos; registrar somente os achados que mudem a implementação.
2. **Cadastro protegido:** habilitar signup público e aplicar as proteções necessárias no fluxo real.
3. **Isolamento:** corrigir os pontos de acesso que permitam leitura ou escrita fora do workspace do usuário; preservar exceção administrativa explícita.
4. **Provisionamento:** criar/associar workspace e prefixos lógicos no Storage e no repositório, conforme necessário. O provisionamento deve ser seguro para retry.
5. **Validação:** testar dois usuários distintos e um administrador, incluindo tentativas de acesso cruzado e abuso básico de cadastro.
6. **Publicação:** apresentar evidências e solicitar autorização para o rollout em produção.

A etapa 1 não deve se transformar em uma auditoria geral ou em uma nova fase de arquitetura. Seu único propósito é identificar os pontos concretos que precisam ser modificados.

## 6. Critérios de aceite

- Um novo usuário consegue cadastrar-se sem convite, sujeito às proteções configuradas.
- A proteção anti-bot/rate limit atua no endpoint ou fluxo efetivo de cadastro.
- Usuário A não consegue listar, consultar, alterar, baixar ou excluir recursos do usuário B, inclusive por chamadas diretas à API.
- Usuário B não consegue acessar os recursos de A.
- Administrador autorizado consegue exercer a visão global prevista.
- O provisionamento de workspace é idempotente e não duplica registros ou espaços.
- Arquivos permanecem privados e os caminhos de Storage são validados no backend/policies.
- Nenhum segredo ou credencial é exposto no cliente ou armazenado em documentos públicos.
- Testes de regressão confirmam que as funções existentes do SCP continuam operacionais.
- O diff permanece limitado ao necessário para cumprir esta missão.

## 7. Evidências operacionais

A implementação deverá produzir ORs para as etapas efetivamente concluídas, com referência a commits, testes e evidências. O FOR será consolidado ao final conforme o padrão operacional vigente. O TR permanece o documento de definição e controle desta missão; o Blueprint só será derivado depois de sua aprovação.

## 8. Gate humano

**AWAITING_HUMAN_VALIDATION.**

Este TR é uma proposta para revisão. Nenhuma tarefa de implementação está autorizada até que o responsável aprove explicitamente esta versão ou uma versão revisada. Após aprovação, será elaborado o Blueprint derivado do TR aprovado e a execução poderá começar conforme os gates definidos.

## 9. Declaração de não execução

Na criação deste documento:
- nenhum código do SCP foi alterado;
- nenhuma migration, policy, grant ou configuração foi aplicada;
- nenhum bucket, repositório ou workspace foi criado;
- nenhum deploy foi iniciado;
- nenhum crédito Manus foi consumido.
