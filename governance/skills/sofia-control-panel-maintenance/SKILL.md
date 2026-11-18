---
name: sofia-control-panel-maintenance
description: "Diagnóstico e manutenção segura do SofiaControlPanel. Use ao corrigir UI, backend ou testes do SCP dentro de missão atribuída, especialmente fluxos de orquestração; não autoriza chamadas externas, alterações de produção ou deploy."
---

# Sofia Control Panel Maintenance

## Escopo

Apoiar mudanças pequenas e rastreáveis no repositório SofiaControlPanel. Esta skill é `DRAFT`: foi criada para cobrir manutenção técnica ausente do registry e ainda não constitui prática validada em produção.

## Fluxo

1. Ler `AGENTS.md`, o blueprint e a tarefa ativa; reconciliar branch, estado remoto, locks e alterações locais antes de editar.
2. Selecionar somente contratos e caminhos de código necessários. Separar fatos observados de hipóteses, sobretudo quando a causa depender de serviço externo.
3. Preferir funções puras e testes locais determinísticos. Mockar banco, rede e serviços externos; não usar credenciais ou dados de produção em testes.
4. Preservar contratos públicos e estados explícitos. Para transições UI, distinguir execução iniciada, aguardando gate/agente e erro; não inferir sucesso a partir de resposta vazia.
5. Para logs, registrar códigos estáveis, status HTTP/request ID somente quando obtidos com segurança; nunca registrar tokens, headers, payloads integrais, prompts, conteúdo de missão ou mensagens arbitrárias do provedor.
6. Validar alterações com testes direcionados, `pnpm check`, `pnpm test` e `pnpm build`, quando viável. Inspecionar `git diff --check` e confirmar que nenhum efeito externo foi executado.
7. Aplicar a convenção de versão do projeto: incrementar `VERSION.txt` em um centésimo por mudança funcional entregue (por exemplo, `1.02` para `1.03`), sem alterar versões de dependências como substituto.
8. Produzir Operational Report, atualizar o índice e o quadro da missão, commitar a unidade lógica e publicar somente na branch isolada se `main` implicar deploy. Não fazer merge/deploy sem autorização específica.

## Limites

Esta skill não autoriza chamadas autenticadas a APIs, consumo de créditos, leitura/escrita em banco de produção, migrações, alteração de segredos, merge para branch de produção, deploy ou comunicação externa. Se a validação depender de contrato externo não comprovado, preservar a incerteza e deixar esse gate explícito.
