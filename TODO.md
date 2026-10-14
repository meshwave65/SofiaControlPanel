# Sofia Control Panel — TODO

## Núcleo operacional
- [ ] O usuário autenticado consegue cadastrar uma conta/agente com nome, email/identificador, tipo de conexão e descrição.
- [ ] Segredos nunca são retornados em listagens nem preenchidos novamente no formulário de edição.
- [ ] Cada agente exibe status operacional, conexão, crédito conhecido, última sincronização, heartbeat e tarefa atual.
- [ ] O painel distingue `online`, `idle`, `paused`, `offline`, `sem créditos`, `erro de conexão` e `não configurado`.
- [ ] O usuário consegue pausar/retomar um agente sem apagar histórico.
- [ ] O dashboard apresenta totais reais, sem créditos fixos ou dados mockados.

## Tarefas e telemetria
- [ ] Criar tarefa usa mutation real e permite atribuição por agente.
- [ ] Lista e detalhe usam os mesmos nomes de campos do backend.
- [ ] Mensagens e logs exibem dados reais; mocks ficam apenas em testes.
- [ ] Heartbeat e sincronização de créditos são atualizados por worker/integrador oficial.

## Segurança e integração
- [ ] Definir `CREDENTIAL_ENCRYPTION_KEY` no ambiente de produção.
- [ ] Adicionar integração oficial Manus/OAuth/token com escopos mínimos.
- [ ] Criar auditoria de alterações e revogação de credenciais.
- [ ] Não automatizar MFA/captcha nem armazenar senha em texto puro.

## Validação
- [x] `pnpm check` sem erros.
- [x] `pnpm test` verde.
- [x] `pnpm build` verde.
- [x] Validar rotas e manifesto `manus-routes.json`.
