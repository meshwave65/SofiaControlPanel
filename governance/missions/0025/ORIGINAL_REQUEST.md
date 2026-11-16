# Solicitação original — MISSION_0025

**Título:** Cadastro Público Protegido e Isolamento Multiusuário do SCP  
**Solicitante:** Responsável pelo produto  
**Data de registro:** 2026-11-16  
**Estado:** Registrada — aguardando aprovação do TR

## Solicitação

Preparar e implementar posteriormente a abertura do cadastro do SofiaControlPanel sem exigir convite individual, mantendo proteção contra bots, cadastros automatizados e criação abusiva de contas.

Cada usuário deve operar em um espaço próprio, sem visualizar ou acessar agentes, missões, arquivos, artefatos ou dados pertencentes a outros usuários. A administração global deve continuar podendo consultar os espaços conforme permissões administrativas.

O provisionamento de uma nova conta deve preparar seu espaço de trabalho nos recursos compartilhados do SCP, incluindo a organização lógica dos documentos no GitHub e dos arquivos no Supabase Storage, sem criar infraestrutura isolada desnecessária por usuário.

## Condição de início

A missão foi registrada para execução futura. **Nenhuma implementação pode começar antes da aprovação explícita do TR pelo responsável.** A aprovação do TR é um gate obrigatório e não pode ser inferida de mensagens informais ou de aprovação de outro documento.

Até esse gate:
- não alterar código, banco, RLS, Storage, autenticação ou deploy;
- não criar workers, buckets, repositórios ou serviços;
- não iniciar tarefas Manus nem consumir créditos;
- não gerar Blueprint executável.

## Diretriz de execução

A entrega deve priorizar melhoria funcional concreta no SCP. Inspecionar somente o necessário para implementar com segurança, reaproveitar a estrutura existente e evitar refatorações, abstrações ou documentação que não sejam indispensáveis ao resultado.
