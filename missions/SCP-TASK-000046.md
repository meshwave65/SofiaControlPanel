# Conciliação documental e garantia de TR na gênese de missões do SCP

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000046 |
| taskId | 46 |
| source | SofiaControlPanel interface |
| creator | user:1425 |
| creatorType | user |
| statusId | 2 |
| priorityId | 3 |
| parentTaskId |  |
| dueDate |  |
| mirroredAt | 2026-11-20T02:45:14.379Z |

## Description

Investigar e corrigir todos os caminhos de criação para garantir TR imediato; distinguir origem humana e sistêmica; corrigir fallback DRAFT; reconstruir documentos de missões antigas inclusive DONE; permitir validação retrospectiva sem reabrir execução; preservar herança documental da fatoração; criar documentos de ciclo de vida justificáveis; testar, publicar e verificar produção.

## Synchronization contract

- Supabase task ID: `46`
- GitHub path: `missions/SCP-TASK-000046.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.


## Registro operacional adicional — 21/11/2026

Foi persistido no Supabase, em `missionDocuments` documento OR id 30, versão 2 (registro publicado), o relato da reincidência dos bloqueios nas missões 54, 55 e 56 e da falha de inicialização da autenticação.

### Evidências das missões 54–56
- Task 54 / M30 possui TR id 42 com chave `M30_TR`, em `AWAITING_HUMAN_VALIDATION`.
- Task 55 / M31 possui TR id 44 com chave `M31_TR`, em `AWAITING_HUMAN_VALIDATION`.
- Task 56 possui TR id 46 com chave `TR`, também em `AWAITING_HUMAN_VALIDATION`; a task e a versão estão persistidas como origem/autoria humana, divergindo da regra de validação autônoma esperada para missões criadas pelo sistema.
- O código consultado em `client/src/pages/TaskDetail.tsx` seleciona o TR por correspondência exata com `documentKey === "TR"`, tornando invisíveis os documentos com chaves prefixadas M30_TR e M31_TR.

### Evidências de autenticação
- O cliente Supabase mantém `persistSession: true` e `autoRefreshToken: true`.
- A inicialização do SCP tem timeout de 15 segundos.
- Logs do Supabase Auth registraram chamadas a `/user` com latência de até aproximadamente 125,5 segundos, além de respostas `bad_jwt` em outros momentos.
- A causa raiz da latência ainda requer isolamento entre Auth, banco e consulta do usuário interno.

### Trabalho pendente
Corrigir o resolver de TR, a classificação da origem e a validação sistêmica auditável; reconciliar 54–56 sem duplicar documentos ou falsificar proveniência; investigar e corrigir a latência de autenticação; executar testes e confirmar o deploy ativo. Nenhuma correção de código, status de missão ou deploy foi declarada concluída por este registro.

**Referência operacional:** Supabase `missionDocumentVersions.id=64`, `documentId=30`, versão 2, estado PUBLISHED.
