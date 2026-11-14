# Automação de contatos — MISSION_0013

**Estado:** campanha exploratória autorizada; Gmail operacional e remetente oficial confirmado como `info@meshwave.com.br` em 2026-10-29.  
**Arquivo mestre:** [CONTROLE_INVESTIDORES.csv](./CONTROLE_INVESTIDORES.csv)

## Objetivo

Automatizar o envio individualizado de mensagens de prospecção e manter trilha de auditoria de cada investidor, desde a identificação até resposta, reunião, due diligence ou encerramento.

## Estado da lista após o primeiro lote

A longlist contém 11 organizações. Em 2026-10-29, foram enviados dois primeiros contatos individualizados pelo Gmail, remetente `info@meshwave.com.br`: OKX Ventures (`ventures@okx.com`) e Blockchain Founders Fund (`contact@bff.com`). O provedor retornou IDs de mensagem para ambos; entrega não foi confirmada independentemente. Os outros nove registros permanecem sem contato. Para Valor Capital Group, a página institucional orienta empresas com pitch a iniciar pelo fluxo `Get Started`; o endereço `info@valorcapitalgroup.com` é apresentado para consultas gerais e não foi usado como substituto do canal de candidatura.

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

## Estado e bloqueios atuais

1. Gmail está operacional para leitura e envio; o responsável confirmou `info@meshwave.com.br` como remetente oficial de todas as comunicações MeshWave.
2. Dois primeiros contatos foram enviados individualmente: OKX Ventures e Blockchain Founders Fund. Os IDs retornados pelo Gmail estão registrados no CSV mestre. Não há confirmação independente de entrega ou leitura.
3. Valor Capital Group: usar o fluxo institucional `Get Started` para submissão de pitch, não o endereço de consultas gerais como atalho.
4. Equity e MWN ainda têm lacunas comerciais/jurídicas documentadas no dossiê. Os primeiros contatos são exploratórios e não oferecem termos ainda indefinidos.

## Autorização recebida e critério operacional

Em 2026-10-29, o responsável delegou a condução integral da tarefa, autorizando a automação conforme avaliação de adequação. Esta autorização cobre pesquisa, qualificação, priorização, personalização e primeiro contato institucional exploratório com os investidores da lista, desde que se usem apenas canais profissionais públicos verificados e mensagem sem oferta vinculante ou termos financeiros não definidos.

A primeira abordagem deve pedir uma conversa para avaliar aderência estratégica. Pode mencionar que existem duas possíveis frentes de discussão — participação societária na MeshWave e/ou ativo digital MWN — mas deve deixar claro que estrutura, direitos, condições e due diligence serão discutidos separadamente. Não anexar decks ou documentos não aprovados, não fixar valuation, ticket, percentual, quantidade, preço ou retorno.

A autorização cobre a prospecção exploratória por canais profissionais públicos verificados. A caixa Gmail foi conectada e o responsável confirmou `info@meshwave.com.br` como remetente oficial. Os envios devem ser individuais, com registro do ID retornado pelo provedor e sem confundir aceitação técnica com entrega ou leitura. Formulários sem automação oficial ou sem campos adequados ficam como ação manual registrada, não contornar controles.

## Critério operacional

A caixa remetente está ativa. A autorização de campanha exploratória foi recebida; não é necessário pedir nova aprovação de cada mensagem individual se o conteúdo permanecer dentro dos limites acima. Prosseguir com destinatários e canais institucionais verificados, registrar cada resultado observável e respeitar a cadência de 7 dias.
