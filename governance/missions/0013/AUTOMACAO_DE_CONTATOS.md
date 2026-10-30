# Automação de contatos — MISSION_0013

**Estado:** preparado; envio externo ainda não habilitado nesta execução.  
**Arquivo mestre:** [CONTROLE_INVESTIDORES.csv](./CONTROLE_INVESTIDORES.csv)

## Objetivo

Automatizar o envio individualizado de mensagens de prospecção e manter trilha de auditoria de cada investidor, desde a identificação até resposta, reunião, due diligence ou encerramento.

## Estado inicial da lista

A longlist contém 11 organizações. Todas começam como `IDENTIFIED` e `NOT_CONTACTED`. A lista preliminar contém três endereços de email institucionais identificados publicamente (OKX Ventures, Blockchain Founders Fund e Valor Capital Group); os demais canais exigem confirmação do formulário/rota oficial antes de qualquer abordagem. A presença de um email nesta lista não significa que a mensagem foi enviada.

## Fluxo de automação

1. **Enriquecer e validar:** confirmar site, tese atual, formulário/email institucional e pertinência da oportunidade.
2. **Classificar a trilha:** equity, MWN ou parceiro estratégico. Não apresentar as duas contrapartidas como equivalentes.
3. **Gerar mensagem individual:** personalizar apenas fatos públicos da tese do investidor e fatos MeshWave suportados pelo dossiê. Nunca inventar relacionamento, indicação ou interesse.
4. **Fila:** criar registro `QUEUED` somente após destinatário, canal, versão de mensagem e autorização de campanha aprovados.
5. **Envio:** transmitir pela caixa conectada; gravar timestamp UTC, identificador do provedor e resultado técnico. Só marcar `SENT` após retorno positivo do provedor.
6. **Entrega:** marcar `DELIVERED` apenas quando houver evento confiável de entrega; rejeições/bounces devem ser `BOUNCED`.
7. **Resposta:** correlacionar respostas por endereço e thread. Registrar data, resumo fiel, classificação e próximo passo. Não inferir interesse a partir de resposta automática.
8. **Follow-up:** somente conforme política de cadência aprovada; respeitar recusa, opt-out e `DO_NOT_CONTACT`.
9. **Relatório:** atualizar o CSV após cada evento e exportar a versão corrente para revisão.

## Estados

- Qualificação: `IDENTIFIED`, `RESEARCHING`, `READY_FOR_APPROVAL`.
- Envio: `QUEUED`, `SENT`, `DELIVERED`, `BOUNCED`.
- Relacionamento: `REPLIED`, `MEETING`, `DUE_DILIGENCE`, `FOLLOW_UP`, `ON_HOLD`.
- Encerramento: `DECLINED`, `NO_RESPONSE`, `DO_NOT_CONTACT`.

Os estados não são intercambiáveis: `SENT` não prova entrega; `DELIVERED` não prova leitura; resposta automática não equivale a interesse; ausência de resposta não significa recusa.

## Regras de integridade

- Um registro por organização e canal/contato, sem duplicar envio para a mesma thread.
- Preservar histórico de eventos; correções devem ser anotadas, não apagar evidência anterior.
- Não marcar contato como realizado sem log real do provedor.
- Não usar endereços adivinhados nem automação para contornar formulários.
- Não enviar deck, valuation, termos de oferta ou documentos não aprovados.
- Não apresentar MWC como ticker atual: usar MWN, explicando a nomenclatura histórica quando necessário.
- Não misturar a campanha com o kit de apoiadores voluntários ou a captação orgânica existente.

## Bloqueios atuais

1. Não há conexão de caixa de email disponível/confirmada nesta execução. Foi identificada a possibilidade de integração com Hostinger Mail, Gmail ou Outlook; a sugestão de conexão de Hostinger Mail não foi aceita pelo diretório nesta tentativa.
2. Ainda não foi aprovada uma mensagem-base final, nem remetente, nem lista final de destinatários por modalidade.
3. Equity e MWN ainda têm lacunas comerciais/jurídicas documentadas no dossiê. As mensagens não devem prometer termos que ainda não estejam definidos.

## Critério para ativar disparo

Para ativar o envio automatizado em lote, o responsável deve confirmar: (a) caixa remetente conectada; (b) mensagem-base e anexos aprovados; (c) quais investidores da lista estão autorizados; (d) se a abordagem oferece equity, MWN ou apenas conversa exploratória; e (e) cadência e limite de follow-up. Com essa autorização de campanha, a automação pode executar a fila aprovada e registrar cada resultado sem pedir confirmação individual por mensagem.
