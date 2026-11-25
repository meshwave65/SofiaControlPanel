# SCP-TASK-000059 — Espelhamento estrutural seguro do SCP no Sandbox

**Estado:** PROGRESS  
**Criador:** sistema SOFIA (solicitação do operador registrada como proveniência)  
**Agente executor:** meshwave  
**Missão de governança:** [MISSION_0033](../governance/missions/0033/README.md)  
**TR:** [TR-v1.0.0-VALIDATED](../governance/missions/0033/TR-v1.0.0-VALIDATED.md)  
**Blueprint:** [BLUEPRINT-v1.0.0](../governance/missions/0033/BLUEPRINT-v1.0.0.md)

## Solicitação preservada

Executar o procedimento de espelhamento estrutural do SCP no Sandbox como missão de sistema, persistindo TR, Blueprint e demais artefatos, sem aguardar aprovação humana para as etapas técnicas autorizadas. Se a automação não estiver disponível, executar manualmente e registrar evidências.

## Contexto

- Origem: Supabase MeshWave65 `ufylccbdjfzydbwhpmpp`.
- Destino: Supabase Sandbox `detstgxofjnnggxluqtl`.
- Repositório canônico: `meshwave65/SofiaControlPanel`.

## Objetivo

Criar no Sandbox uma estrutura compatível com o escopo SCP, sem copiar dados operacionais, conteúdos privados ou segredos. O catálogo de agentes será sincronizado apenas com metadados autorizados.

## Escopo imediato

1. Inventariar todos os objetos e dependências da origem.
2. Classificar schemas e tabelas.
3. Pesquisar e definir estratégia de migrations reproduzíveis.
4. Implementar estrutura no Sandbox, com RLS e grants seguros.
5. Implementar/validar catálogo de agentes sem segredos.
6. Testar isolamento, compatibilidade e ausência de dados proibidos.
7. Persistir ORs, checkpoints e FOR.

## Restrições

A origem é somente leitura. Não copiar usuários, missões, mensagens, documentos, artefatos, transações ou configurações secretas. Não replicar RLS desabilitado sem revisão. Não realizar alterações fora do projeto Sandbox.

## Primeiro estado

Inventário preliminar concluído; nenhuma alteração de banco executada. Próxima unidade: WP33.1 — inventário estrutural completo.
