# MISSION_0029 — Solicitação original
## Sistema independente de identidade, autenticação e autorização do SCP

**Origem:** autorização expressa do responsável na conversa SOFIA, em 21/11/2026.
**Solicitação recebida:** “sim abra a missão”.

### Contexto
A auditoria da Unidade 20.4.5 da MISSION_0020 identificou que não há mecanismo demonstrado de autenticação delegada e segura para plataformas externas de IA interagirem com o SCP em nome de uma pessoa humana. O responsável autorizou uma missão própria para identidade, autenticação e autorização, mantendo esse escopo separado da integração conversacional, do consentimento de testes e da rastreabilidade da MISSION_0020 / Unidade 20.4.5.

### Requisitos previamente expressos
- Identidade/perfil humano validado pelo SCP; declarações de usuário ou IA não provam identidade nem privilégio.
- Avaliar fatores fortes, incluindo TOTP, passkeys/WebAuthn/FIDO2 e eventual integração gov.br, sem presumir disponibilidade ou viabilidade.
- Sessões persistentes com expiração, revogação e reautenticação.
- Autorização delegada, temporária e específica por plataforma/integração, com escopo mínimo, expiração e revogação.
- Reautenticação/step-up para operações críticas.
- Não armazenar tokens permanentes, senhas, segredos TOTP ou chaves privadas em histórico conversacional ou texto aberto.

### Limites
Esta missão trata de identidade, autenticação, sessão, credenciais delegadas, autorização, expiração, revogação e reautenticação. Não absorve consentimento de testes, logs integrais, Messenger ou adaptador externo da Unidade 20.4.5. A MISSION_0020 poderá depender dos mecanismos definidos aqui, mas mantém sua própria responsabilidade e escopo.

Este registro preserva a solicitação e o contexto de origem. Não aprova arquitetura, fornecedor, método específico nem implementação em produção.