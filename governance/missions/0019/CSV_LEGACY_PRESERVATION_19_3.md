# MISSION_0019 / 19.3 — Política de preservação do INDEX.csv legado

**Status:** proposta implementada em worker e fixtures; aguarda revisão independente.
**Repositório-base:** `SofiaControlPanel`, commit de início `6923056645369ba55b549d4eef1ca4bcf64e2e94`.
**Escopo:** ler e atualizar estados Oracle sem normalizar silenciosamente notas históricas; recuperar uma publicação interrompida e validada.

## Decisão

O schema canônico continua sendo o cabeçalho exato de 11 colunas de `governance/operational_reports/INDEX.csv`. As linhas legadas conhecidas excedem 11 campos porque vírgulas da última coluna (`notes`) não foram escapadas. A implementação não tenta “consertar” essas linhas nem reserializa o arquivo inteiro. Só tolera excedentes quando os dez campos anteriores — de `or_id` a `review_commit` — continuam alinhados e passam validação suficiente para identificá-los sem ambiguidade. Nesse caso, o restante bruto da linha é tratado em memória como a cauda de notas e recebe um registro de anomalia.

A verificação no índice real encontrou nove linhas desse tipo: 14, 16, 23, 34, 36, 38, 42, 45 e 46. Todas mantêm campos centrais reconhecíveis e excedentes apenas depois da décima coluna canônica. O código registra por anomalia o `or_id`, a linha física, o número de campos de nota excedentes e o SHA-256 do registro bruto, sem copiar o conteúdo integral das notas para logs ou metadados.

## Regras de leitura

1. O cabeçalho precisa corresponder exatamente às 11 colunas canônicas. Aspas malformadas, linhas com menos colunas, IDs ausentes/duplicados e linhas excedentes cujo prefixo canônico não seja reconhecível continuam bloqueantes.
2. Um registro com mais de 11 campos só pode ser classificado como nota legada se `or_id`, tarefa, skill/versão, status, estado Oracle, `proposal_status`, `created_at` e eventual `reviewed_at` mantiverem posições e formatos reconhecíveis. Não se inferem colunas ausentes, não se deslocam valores e não se corrigem timestamps.
3. O parser guarda spans dos campos, posições do registro e separadores originais. A cauda de notas bruta é mantida em memória e usada para inventário/hash; nunca é reconstruída no arquivo a partir de uma lista de células.
4. A leitura é UTF-8 estrita com round-trip de bytes. Arquivo com bytes inválidos é bloqueado; BOM, terminadores LF/CRLF e linhas vazias não são normalizados.
5. Datas antigas no formato apenas `YYYY-MM-DD` podem ser reconhecidas para não confundir a posição das colunas. Isso não as torna válidas como evidência temporal: se um OR assim for selecionado, a validação estrutural exige timestamp ISO 8601 com fuso horário e não o aceitará automaticamente. Foram observados três registros date-only (linhas 17–19), uma condição distinta das notas CSV legadas.

## Comportamento visível e auditabilidade

Dry-run não grava nada. Ele expõe a lista de anomalias e conserva exatamente o hash do arquivo. Reviews de escrita incluem cada linha legada, `or_id`, número de campos excedentes e hash bruto. Enquanto existir ao menos uma dessas anomalias, a decisão estrutural recebe aviso e não pode ser `ACCEPTED` sem ressalva; a implementação usa `PARTIALLY_ACCEPTED` quando não há outro erro, preservando o bloqueio de gates posteriores por política.

Se a própria linha revisada tiver notas excedentes, o worker substitui somente o campo 6 (`oracle_status`) e o campo 9 (`reviewed_at`) pelos seus spans conhecidos. O restante do registro — inclusive vírgulas, espaços, notas, BOM e final de linha — é preservado. Linhas não selecionadas permanecem byte a byte iguais. Nenhuma migração, edição de notas, mudança de cabeçalho ou reconstrução dos registros existentes faz parte desta tarefa.

## Escrita transacional e recuperação

A escrita requer lock exclusivo `governance/oracle/.dispatcher.lock`, criado com `wx` e payload de PID, instante, versão e token de posse. Locks existentes, inclusive stale, não são removidos automaticamente. Sob lock, o worker relê o índice e compara o hash completo com o snapshot usado para selecionar a fila.

Reviews e índice atualizado são staged em temporários no mesmo diretório de destino e sincronizados antes de persistir `governance/oracle/.dispatcher.transaction.json`. O journal contém versão, transaction ID, hashes pré/pós do índice e caminhos/hash de cada review staged. Reviews são publicados sem overwrite por criação exclusiva de hard-link; o índice é substituído por rename atômico por último. O journal só é removido depois de os destinos e o hash pós-transação serem verificados.

Se a execução parar depois do journal, nova rodada normal falha com `RECOVERY_REQUIRED`. A retomada é deliberada (`--recover`), sob novo lock. A recuperação aceita apenas caminhos canônicos internos, journals no schema esperado e arquivos cujo hash corresponda ao manifesto. Ela retoma operações já instaladas sem duplicar, completa o índice se ele ainda tiver o hash anterior e remove o journal após verificação. Divergência, destino preexistente com conteúdo diferente, arquivo ausente ou journal inválido preserva o journal e bloqueia para inspeção manual. Não há tentativa automática de rollback de conteúdo desconhecido.

Falha antes da publicação do journal pode deixar temporários órfãos; o índice original permanece intacto e a limpeza é manual, após inspeção. Não se varrem nem removem temporários por idade ou padrão automaticamente.

## Evidência e limites

- Fixtures validam detecção e hash de anomalias, dry-run sem escrita, preservação da nota bruta em linha visada e da linha histórica não visada, atualização apenas de estados, round-trip com BOM/CRLF, bloqueio de cauda ambígua e recuperação idempotente após publicação parcial de review.
- O índice real foi usado somente em dry-run filtrado para `MISSION_0019-19.2`. O worker enumerou nove anomalias, selecionou OR-20261108-0033 como `PARTIALLY_ACCEPTED` e confirmou SHA-256 idêntico antes/depois. Nenhum OR real foi gravado ou aprovado.
- A política não resolve a semântica das notas antigas nem normaliza os nove registros. Qualquer migração futura precisa ser commit separado, com relatório de valores pré/pós, revisão e teste de contagem/IDs/hashes.
- Concorrência e falha abrupta foram exercitadas deterministicamente em fixtures; não equivalem a um ensaio de power-loss/filesystem em produção.
