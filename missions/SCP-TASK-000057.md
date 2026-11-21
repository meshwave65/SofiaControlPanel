# Formalização do protocolo de esclarecimento, aditivos e aprovação documental da SOFIA

> Espelho operacional da missão SCP. Fonte de execução: Supabase. Este arquivo registra proveniência e documentação versionada.

## Metadata

| Campo | Valor |
|---|---|
| missionKey | SCP-TASK-000057 |
| taskId | 57 |
| ownerUserId | 152 |
| createdBy | 152 |
| creatorType | user |
| status | PAUSED — aguardando consolidação e aprovação do TR |
| priority | Crítica |
| githubPath | missions/SCP-TASK-000057.md |

## Solicitação original

Estamos tratando fora de uma missão e precisamos formalizar no fluxo do SCP/SOFIA o protocolo definido nesta conversa e persistir sua especificação na documentação. O protocolo deve abranger: dúvida identificada durante a missão; pausa e diálogo de esclarecimento; elaboração de aditivo ao TR quando a solução exigir alteração de escopo ou definição; ciclos de revisão do aditivo; apresentação formal para aprovação; aprovação por manifestação textual ou por voz nos canais conversacionais, com a mesma validade da ação explícita de aprovação na interface SCP; reconhecimento estrito da palavra isolada APROVADO, sem distinção entre maiúsculas e minúsculas; rejeição de confirmações acompanhadas de outras palavras, mesmo quando semanticamente positivas; orientação ao usuário para repetir a aprovação conforme o rito; retorno ao esclarecimento quando houver objeção, dúvida ou solicitação de alteração; após aprovação válida, aplicação das mudanças necessárias no BP, registro do OR da paralisação, atualização do FOR, FR e demais documentos afetados, validação e retomada da missão. Missões system dispensam aprovação humana do TR inicial conforme regra própria, mas aditivos que exijam decisão/intervenção humana sempre dependem de aprovação humana formal.

## TR — Versão 1 (DRAFT; não aprovada)

### Objetivo
Formalizar o ciclo de intervenção humana durante a execução de missões SOFIA, com esclarecimentos, aditivos ao TR, aprovação formal multicanal e retomada controlada.

### Escopo funcional a especificar
1. Detectar dúvida, lacuna ou conflito não resolvido pelo TR vigente e pausar a execução quando a decisão humana for necessária.
2. Abrir interação de esclarecimento com o responsável pela missão. A SOFIA pode fazer perguntas sucessivas até obter informação suficiente.
3. Determinar se a solução exige aditivo ao TR. Não sobrescrever o TR original: produzir aditivo identificado e versionado, preservando o histórico.
4. Permitir diálogo, objeções e revisões do aditivo antes de iniciar o rito formal de aprovação.
5. Apresentar o aditivo completo e iniciar estado formal de aprovação vinculado à missão, ao documento e à versão exata.
6. Aceitar aprovação pelo botão formal do SCP ou, nos canais conversacionais autenticados (aplicativo SOFIA e integrações de IA externa), por manifestação isolada APROVADO. A comparação deve ignorar caixa (APROVADO/aprovado/ApRoVaDo), mas não aceitar palavras adicionais, justificativas ou qualificadores.
7. Se a resposta tiver conteúdo adicional, inclusive uma confirmação semanticamente positiva, não registrar aprovação. Orientar o usuário sobre o rito e reiniciar a apresentação/etapa formal de aprovação do mesmo documento e versão, desde que permaneçam inalterados.
8. Se a resposta contiver dúvida, objeção ou pedido de mudança, encerrar a tentativa de aprovação, retornar ao esclarecimento/revisão e gerar nova versão do aditivo quando houver alteração. A versão anterior permanece preservada e não aprovada.
9. Registrar evidência de aprovação com identidade autenticada do aprovador, missão, documento, versão/hash, instante e canal. A aprovação é vinculada imutavelmente à versão exata.
10. Após aprovação válida, aplicar alterações no BP e demais estruturas afetadas, registrar OR da paralisação, atualizar FOR e FR e documentos correlatos, validar consistência e somente então retomar a missão.
11. Evitar reaplicação de efeitos em retransmissões ou duplicidade de mensagens por meio de idempotência.

### Regras de governança
- O botão SCP e a manifestação textual/voz são interfaces distintas para o mesmo mecanismo central de aprovação.
- A palavra isolada APROVADO é um protocolo formal de confirmação, não uma inferência semântica do LLM.
- O LLM pode interpretar dúvidas e objeções, mas não pode substituir a validação determinística da aprovação.
- Missões system não exigem aprovação humana do TR inicial conforme a regra de criação sistêmica; contudo, qualquer aditivo que dependa de intervenção/decisão humana exige aprovação humana formal.
- Messenger é canal de interação no SCP, não substitui o registro formal de aprovação. Aplicativo e IA externa devem acionar o mesmo mecanismo central.
- Estados da missão, do documento/aditivo e da aprovação devem ser independentes. Aprovar não retoma automaticamente a missão: aplicação e validação precedem a retomada.

### Fora do escopo desta versão inicial
Definição física final de tabelas, criptografia, gestão de chaves, desenho de infraestrutura e implementação de integrações específicas. Esses pontos dependem de auditoria do modelo atual e decisão técnica posterior.

### Critérios de aceite a detalhar
- Aprovação isolada aceita sem distinção de caixa.
- Qualquer texto adicional impede aprovação formal.
- Objeção/dúvida retorna ao ciclo de esclarecimento.
- Alteração do aditivo exige nova versão e nova aprovação.
- Evidência identifica usuário, canal, documento e versão/hash.
- Efeitos documentais/operacionais são idempotentes.
- Missões system exigem aprovação humana para aditivos que demandem decisão humana.
- Retomada somente após aplicação e validação dos ajustes.

## Sincronização
- Registro principal: Supabase sofia.tasks, taskId 57.
- Documentos: ORIGINAL_REQUEST versão 1 publicada; TR versão 1 em DRAFT.
- Alterações de missão e documentos devem ser persistidas no Supabase e espelhadas neste arquivo.
