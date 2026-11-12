# Registro canônico de parâmetros

Este registro aponta as chaves e suas fontes canônicas. A política geral está em [CONFIGURATION_AND_PARAMETER_GOVERNANCE.md](../CONFIGURATION_AND_PARAMETER_GOVERNANCE.md).

| Chave | Domínio | Unidade | Valor de referência documentado | Fonte operacional pretendida | Estado |
|---|---|---|---:|---|---|
| `UMS_PER_MWN` | MW-Ex / ponte UMS↔MWN | UMS por MWN | 1000 | Tabela versionada `mwex_economic_parameters` no banco de dados | Referência atual conhecida; migração/validação da fonte runtime pendente |

## Contrato de `UMS_PER_MWN`

- Descrição: quantidade de UMS correspondente a uma unidade inteira de MWN na relação de conversão vigente.
- Tipo: inteiro positivo.
- Versionamento: obrigatório. Cada versão possui ID/chave, valor, estado, vigência, autoria, aprovação e justificativa.
- Vigência: uma versão aprovada/ativa é selecionada para cada nova operação; não se altera uma versão já utilizada.
- Persistência histórica: toda conversão grava o identificador da versão aplicada e os valores/unidades necessários à auditoria.
- Alteração: criar nova versão; nunca editar transações antigas para refletir o parâmetro novo.
- Fonte runtime: a tabela é a fonte operacional pretendida. Até que sua existência, schema, políticas de acesso e integração sejam verificadas no ambiente, não presumir que a migração já foi implementada. O valor nesta tabela documental é referência de governança, não substituto silencioso da fonte runtime.

## Regra de manutenção

Não repetir valores de parâmetros mutáveis em outros documentos. Referenciar a chave e este registro. Se a documentação precisar exibir o valor vigente em vários lugares, esses trechos devem ser gerados de uma fonte única e validados automaticamente; Markdown puro não atualiza valores dinamicamente.
