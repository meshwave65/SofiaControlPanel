# Diretriz de arquitetura — Configuração e governança de parâmetros

**Estado:** NORMA ARQUITETURAL  
**Data:** 2026-11-11  
**Aplicação:** todos os projetos, módulos, serviços, interfaces, bancos de dados e artefatos documentais do ecossistema MeshWave/Sofia.

## 1. Princípio obrigatório

Não espalhar valores, regras ou referências mutáveis diretamente pelo código, consultas SQL, interfaces, scripts, arquivos de documentação ou automações.

Todo parâmetro que possa variar por ambiente, usuário, operação, política, versão ou decisão de negócio deve possuir uma **fonte canônica única**, explicitamente identificada e controlada.

**Ênfase desta diretriz:** impedir que valores econômicos e regras operacionais variáveis sejam espalhados ou duplicados. Exemplos centrais incluem valor de referência/mercado da UMS e da MWN em moeda fiduciária; taxas e relações de conversão (por exemplo, `x UMS = y MWN`); taxas de compra, venda e intermediação; spreads, limites e demais condições econômicas. Esses valores precisam de origem identificável, atualização controlada, versionamento, vigência e histórico auditável.

O princípio é **centralizar e controlar**, não impor uma tecnologia única de persistência. A escolha do mecanismo deve respeitar a natureza, o ciclo de vida, os requisitos de segurança e a forma de consumo de cada informação. A diretriz também abrange outros parâmetros mutáveis — limites, prazos, TTLs, flags operacionais, endpoints configuráveis e critérios de elegibilidade — sem presumir que todos devam residir no banco de dados. Constantes matemáticas e valores intrínsecos ao protocolo podem permanecer no código quando forem realmente invariáveis; a classificação deve ser explícita, não presumida.

Para parâmetros econômicos e dados de mercado, aplicar também a norma específica [ECONOMIC_PARAMETER_GOVERNANCE.md](ECONOMIC_PARAMETER_GOVERNANCE.md), que diferencia relações internas de conversão, cotações fiduciárias, preços executáveis, spreads, taxas e limites.

## 2. Onde armazenar

A escolha depende do ciclo de vida e da natureza do parâmetro:

- **Banco de dados:** parâmetros operacionais ou de negócio que possam mudar sem novo deploy, precisem de vigência, histórico, escopo por usuário/conta/mercado ou auditoria. Preferir tabela dedicada de parâmetros, com acesso controlado.
- **Arquivo de configuração central:** parâmetros de build, ambiente, implantação ou execução que devam ser versionados junto ao código e não precisem de alteração transacional em runtime.
- **Secret manager / variáveis protegidas de ambiente:** credenciais, tokens, chaves privadas e segredos. Nunca armazenar segredos em arquivos públicos, documentação ou repositório.
- **Registro documental:** a documentação pode descrever a semântica, a chave, a fonte canônica e o procedimento de alteração; não deve se tornar uma cópia concorrente do valor operacional.

Não criar múltiplas fontes de verdade para o mesmo parâmetro. Quando houver configuração por ambiente, deve existir uma hierarquia de precedência explícita e verificável.

## 3. Contrato mínimo de parâmetro

Cada parâmetro mutável deve possuir, conforme aplicável:

- chave estável e nome semântico;
- descrição, unidade e domínio de validade;
- fonte canônica e escopo;
- valor e versão;
- estado (rascunho, aprovado, ativo, suspenso ou substituído);
- vigência inicial/final e fuso horário, quando aplicável;
- autor, aprovador, timestamps e justificativa;
- validação, limites e comportamento de fallback;
- política de cache/propagação e invalidação;
- trilha de auditoria.

Alterações devem criar nova versão ou novo registro de vigência; não sobrescrever o histórico.

## 4. Histórico transacional e reprodutibilidade

Toda operação que dependa de parâmetro mutável deve registrar a versão/ID efetivamente aplicada e, quando necessário à reprodução independente, um snapshot imutável dos valores relevantes e da unidade.

Uma mudança posterior não pode reinterpretar, recalcular silenciosamente ou alterar transações, contratos, relatórios ou decisões históricas. Correções retroativas exigem evento explícito, justificativa, autorização e trilha de auditoria.

## 5. Proibição de hardcoding e duplicação

Antes de concluir uma implementação, revisar código, SQL, UI, testes, scripts, documentação e workflows para identificar:

- valores operacionais repetidos como literais;
- cópias divergentes de uma mesma regra;
- defaults ocultos em componentes;
- fallback que contorne a fonte canônica;
- parâmetros com nomes diferentes sem mapeamento explícito.

O código deve consultar a fonte canônica por chave tipada/validada, não replicar o valor. Testes podem usar fixtures explícitas, desde que identificadas como dados de teste e não confundidas com configuração de produção.

## 6. Documentação Markdown e hipertexto

Markdown comum é texto estático: não possui, por si só, mecanismo nativo para interpolar valores dinâmicos de banco de dados, variáveis ou arquivos externos.

A documentação deve preferir:
- links relativos para a especificação/registro canônico do parâmetro;
- referência à chave estável (por exemplo, `UMS_PER_MWN`) em vez de repetir seu valor;
- tabelas de parâmetros geradas automaticamente por script/CI, quando a publicação de valores for necessária;
- front matter ou convenções próprias somente se houver ferramenta de build que as interprete e valide.

Um link Markdown fornece navegação, não sincronização automática. Não afirmar que um documento atualiza seu conteúdo sozinho. Se for necessário mostrar o valor vigente em vários documentos, gerar esses trechos a partir de uma única fonte e validar a atualização no CI.

## 7. Critério de aceite para qualquer desenvolvimento

Uma entrega que introduza ou altere parâmetro mutável só é aceita quando:

1. a fonte canônica foi definida;
2. a chave e o contrato do parâmetro foram documentados;
3. não há cópias operacionais independentes hardcoded;
4. alterações são versionadas e auditáveis;
5. operações históricas preservam a versão aplicada;
6. testes cobrem ausência, valor inválido, mudança de versão, cache e fallback;
7. documentação aponta para a fonte canônica;
8. migração e compatibilidade são tratadas sem renomeações ou mudanças silenciosas.

**Regra final:** primeiro localizar/definir a fonte canônica; depois implementar o consumo. Nunca implementar espalhando o valor e tentar centralizá-lo posteriormente.
