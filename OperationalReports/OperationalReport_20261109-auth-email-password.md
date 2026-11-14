---
or_id: "OR-20261109-0004"
task_id: "SCP-AUTH-EMAIL-PASSWORD"
skill_name: "operational-task-lifecycle"
skill_version: "0.2.0-DRAFT"
skill_commit: "main — SHA imutável não capturado"
agent: "Manus (sandbox)"
environment: "sandbox:root:DjAJNQVaYKEDJthVvvdKHh"
status: "SUBMITTED"
oracle_status: "PENDING"
proposal_status: "NONE"
created_at: "2026-11-09T21:05:00-03:00"
---

# OperationalReport — OR-20261109-0004

## Objective

Corrigir o acesso do SofiaControlPanel para permitir login e cadastro por e-mail/senha, sem remover o login Google nem enfraquecer a autenticação Supabase existente.

## Inputs, outputs, and tools

- Inputs: `client/src/pages/Home.tsx`, `client/src/lib/auth/index.ts`, `client/src/lib/supabase.ts`, `client/src/_core/hooks/useAuth.ts`, `server/_core/context.ts`.
- Outputs: formulário público de login/cadastro em `client/src/pages/Home.tsx`; este Operational Report.
- Tools: inspeção estática, `git diff --check` e `pnpm check`.

## Execution summary

A causa foi confirmada no frontend: os helpers `login` e `register` já existiam em `client/src/lib/auth/index.ts`, mas a página inicial importava e oferecia somente `startGoogleLogin`. A tela agora oferece:

- login Google preservado;
- login com e-mail e senha via `supabase.auth.signInWithPassword`;
- cadastro com e-mail e senha via `supabase.auth.signUp`;
- mensagem para confirmação de e-mail quando o projeto Supabase não cria sessão imediatamente;
- mensagens de erro e estado de submissão;
- `autocomplete` e limite mínimo de seis caracteres na senha.

O backend continua validando o bearer token Supabase em `server/_core/context.ts`, portanto nenhuma rota protegida foi aberta sem sessão válida.

## Problems and workarounds

- `pnpm check` não pôde concluir porque o sandbox não tem `@types/node`/`vite/client` instalados e a configuração atual também é rejeitada pela versão local do TypeScript por `baseUrl` depreciado. O diff foi verificado com `git diff --check`.
- A habilitação efetiva do provedor Email no projeto Supabase não pode ser confirmada apenas pelo repositório. Se o provedor estiver desabilitado no painel Supabase, o formulário exibirá o erro retornado pelo serviço e será necessário habilitá-lo na configuração do projeto.

## Evidence and uncertainty

Confirmado no código: o método de senha já existia; faltava somente a interface que o acionava. Confirmado no diff: não houve alteração no fluxo de sessão, no backend, no schema ou em credenciais. Não confirmado por execução: login real, confirmação de e-mail e configuração do provedor Email no Supabase, pois não há sessão/ambiente configurado nesta sandbox.

## Improvement proposals

- **P-AUTH-01:** adicionar teste de componente para alternância login/cadastro e tratamento de erro; benefício: regressão detectável; risco baixo; prioridade média; backward-compatible: sim.
- **P-AUTH-02:** documentar no checklist de deployment que o provedor Email e as URLs de redirecionamento devem estar habilitados no Supabase; benefício: evita falso diagnóstico de frontend; risco baixo; prioridade alta; backward-compatible: sim.

## Privacy, safety, and scope review

Nenhuma senha, token ou dado pessoal foi registrado. A implementação envia credenciais somente para o SDK Supabase já utilizado pelo aplicativo; não adiciona armazenamento local de senha nem endpoint próprio de senha. Nenhuma comunicação externa, alteração de banco ou mudança de política foi feita.

## Oracle handoff

Verificar `client/src/pages/Home.tsx`, `client/src/lib/auth/index.ts`, `client/src/_core/hooks/useAuth.ts`, `server/_core/context.ts` e o commit desta correção. Confirmar que o backend continua fail-closed e que o provedor Email deve ser habilitado/configurado no projeto Supabase antes da validação manual.
