# MISSION_0029 — Termo de Referência
## Identidade, autenticação e autorização segura do SCP

**Estado:** DRAFT — abertura e escopo inicial autorizados; arquitetura ainda não aprovada.
**Tarefa-raiz:** SCP-TASK-000052.
**Data:** 21/11/2026.
**Relação:** dependência potencial da MISSION_0020 / Unidade 20.4.5; escopos independentes.

## 1. Objetivo
Definir, projetar, implementar e validar mecanismo transversal de identidade humana, autenticação, gestão de sessão e autorização delegada para o SCP. Integrações externas só poderão atuar dentro das permissões concedidas pelo titular e verificadas pelo backend.

## 2. Princípios
1. Identidade humana verificável; nome, e-mail declarado, prompt ou alegação de IA não autenticam.
2. Autorização validada no backend; cliente não atribui identidade, papel ou escopo a si próprio.
3. Privilégio mínimo por sessão, cliente, recurso e ação.
4. Delegação explícita, temporária, vinculada a titular, cliente, escopo, finalidade, emissão e expiração.
5. Revogação efetiva de sessões e delegações.
6. Segredos, tokens duradouros, sementes TOTP e chaves privadas nunca em mensagens/logs/texto aberto.
7. Operações críticas exigem step-up ou confirmação forte conforme risco.
8. Recuperação de conta não pode contornar fatores ou privilégios.
9. Plataformas externas são clientes não confiáveis até apresentarem autenticação/delegação válida.
10. Privacidade, minimização e auditabilidade sem exposição de segredos.

## 3. Escopo
### 29.1 — Auditoria da autenticação existente
Mapear login, sessão, JWT, refresh, logout, recuperação, provedores, claims, middleware, procedures, RLS e autorização. Distinguir autenticação, papéis e autorização por recurso. Identificar riscos de sessão persistente, revogação, replay, CSRF, XSS, phishing, roubo de token e escalada de privilégio. Não alterar runtime durante auditoria.

### 29.2 — Pesquisa comparativa
Pesquisar fontes oficiais, padrões e implementações mantidas para WebAuthn/FIDO2/passkeys, TOTP, OIDC/OAuth 2.1 e credenciais delegadas. Avaliar gov.br somente com documentação oficial e análise de elegibilidade/requisitos. Comparar segurança, UX, custo, portabilidade, recuperação e esforço operacional. Apresentar evidências e recomendação sem escolha presumida.

### 29.3 — Identidade, fatores e sessão
Definir identidade canônica; enrollment, verificação, substituição e recuperação de fatores; emissão, rotação, persistência, idle/absolute timeout, logout e revogação de sessão; step-up por risco; dispositivos confiáveis sem privilégio permanente.

### 29.4 — Delegação para integrações
Definir cliente, titular, escopos, finalidade, audiência, expiração e revogação. Avaliar OAuth 2.1/Authorization Code com PKCE, token exchange ou alternativa adequada à arquitetura real. Proibir compartilhamento de sessão humana permanente ou tokens pessoais duradouros com IA externa. Definir validação server-side, proteção contra replay, armazenamento seguro e limites por ação/recurso/contexto.

### 29.5 — Autorização e operações críticas
Formalizar modelo compatível com o SCP existente; matriz de ações, recursos, escopos e risco; step-up e confirmação humana para alto impacto; preservar gates humanos.

### 29.6 — Implementação e validação
Implementar somente após arquitetura/plano aprovados. Testar expiração, revogação, replay, troca de titular, escalada, isolamento multiusuário e recuperação. Documentar rollout, migração, compatibilidade e rollback antes de publicação.

## 4. Fora de escopo
Consentimento SOFIA_TEST_CONSENT; persistência conversacional, Messenger, adaptador externo e logs integrais da Unidade 20.4.5; escolha antecipada de fornecedor; alterações em produção sem plano aprovado; compartilhamento de tokens permanentes com plataformas externas.

## 5. Critérios de aceite
1. Fluxo atual documentado com evidências.
2. Pesquisa comparativa baseada em fontes oficiais/padrões.
3. Arquitetura aprovada para identidade, fatores, sessão, delegação, escopos e revogação.
4. Backend valida titular, papel, escopo, audiência, expiração e revogação.
5. Nenhuma integração depende de token permanente da sessão humana.
6. Operações críticas exigem step-up conforme política.
7. Recuperação não contorna fatores.
8. Testes comprovam isolamento, rejeição de replay, expiração e revogação.
9. Segredos não aparecem em mensagens, logs ou frontend.
10. Evidências sincronizadas entre Supabase e GitHub.
11. Nenhum merge, deploy, restart ou mudança de produção sem autorização específica.

## 6. Coordenação
A MISSION_0020 / Unidade 20.4.5 pode avançar em auditoria, especificação do adaptador e consentimento sem liberar integração externa operacional. O uso externo autenticado dependerá de mecanismo aprovado nesta missão. As missões não compartilham TR, status, aprovação ou responsabilidade.

## 7. Sequência
Auditoria → pesquisa → arquitetura/threat model → aprovação humana → implementação incremental → testes de segurança → documentação de rollout/rollback → autorização específica de publicação.

A abertura autoriza registro e planejamento, não mudanças de código, schema, configuração, autenticação ativa ou produção.