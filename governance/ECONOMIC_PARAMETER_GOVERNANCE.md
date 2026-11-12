# Governança de parâmetros econômicos e dados de mercado

**Estado:** NORMA DE GOVERNANÇA  
**Data:** 2026-11-11  
**Aplicação:** MeshWave, UMS, MWN, MW-Ex e demais componentes que consumam parâmetros econômicos ou dados de mercado.

## 1. Objetivo e princípio

Este documento consolida as regras para definir, armazenar, alterar, consultar e auditar parâmetros econômicos e dados de mercado utilizados pelo ecossistema.

O princípio obrigatório é **centralizar e controlar**, mantendo uma fonte canônica por informação. Isso não significa armazenar tudo em banco de dados nem impor uma tecnologia única. O mecanismo de persistência deve ser escolhido conforme a natureza, o ciclo de vida, a segurança e os requisitos de auditoria de cada informação.

A diretriz arquitetural geral está em [CONFIGURATION_AND_PARAMETER_GOVERNANCE.md](CONFIGURATION_AND_PARAMETER_GOVERNANCE.md). O inventário de chaves registradas está em [parameters/README.md](parameters/README.md).

## 2. Distinção entre categorias econômicas

As categorias abaixo não podem ser confundidas nem tratadas como se fossem um único tipo de taxa.

### 2.1 Relações internas de conversão

São relações definidas pelo ecossistema para converter unidades ou ativos internos, conforme regras de governança.

Exemplo registrado:
- `UMS_PER_MWN`: quantidade de UMS correspondente a uma unidade inteira de MWN na relação interna vigente.

Essa relação:
- possui chave estável e fonte canônica;
- deve ser versionada e ter vigência;
- só pode mudar por procedimento autorizado;
- deve ser registrada em cada operação pela versão e pelo valor efetivamente aplicados;
- não representa, por si só, cotação fiduciária ou preço de mercado.

A designação atual do ativo é **MWN — MeshWave Network**. **MWC** é somente uma designação histórica/legada; não deve ser usada como nome de ativo em novos materiais, parâmetros ou interfaces.

### 2.2 Valores fiduciários e cotações de referência

São dados que expressam o valor de UMS ou MWN em uma moeda fiduciária, como BRL, USD ou EUR, conforme moedas efetivamente suportadas e aprovadas.

Esses dados não são equivalentes à relação interna `UMS_PER_MWN`. Devem identificar, no mínimo, quando aplicável:
- ativo e par de cotação;
- moeda-base e moeda de cotação;
- valor e unidade;
- fonte/provedor e identificador do mercado ou instrumento;
- natureza do dado: indicativo, referência, bid, ask, último negócio ou outro tipo explicitamente definido;
- horário informado pela fonte e horário de ingestão;
- estado de validação e frescor/validade;
- política para ausência, atraso, divergência ou indisponibilidade da fonte.

Não chamar cotação indicativa de preço executável. Não afirmar que existe mercado líquido, contraparte ou garantia de conversão sem evidência e aprovação próprias. Não inventar preço quando a fonte estiver ausente, inválida ou desatualizada.

### 2.3 Preços executáveis, spreads e liquidação

Quando houver compra ou venda efetiva, o preço aplicado pode depender de contraparte, liquidez, volume, spread, custos e momento de execução.

A operação deve preservar o preço efetivamente executado, a fonte/contraparte, os custos, a moeda, as quantidades, os horários, o estado de liquidação e as referências necessárias à reconciliação.

Uma cotação de referência não substitui o registro de execução. Um spread não deve ser ocultado dentro de uma taxa de conversão interna.

### 2.4 Taxas, tarifas e encargos

Taxas de corretagem, administrativas, de serviço, de conversão ou outras cobranças devem ser parâmetros explícitos, com:
- base de cálculo e unidade;
- ativo/moeda em que são calculadas e cobradas;
- escopo e operação a que se aplicam;
- regra de arredondamento e limites;
- vigência, versão, estado e autoridade de aprovação.

Regra econômica atualmente registrada para MW-Ex: taxas de corretagem/administrativas são zero. Eventuais taxas futuras devem ser formalmente aprovadas e, conforme a regra atual da MISSION_0021, cobradas exclusivamente em UMS na carteira interna — nunca deduzidas de MWN ou do saldo fiat da MW-Ex.

### 2.5 Limites e condições operacionais

Limites por operação, usuário, carteira, período, mercado ou contraparte, bem como regras de elegibilidade, precisam de chaves e contratos próprios. Não devem ser embutidos em código, interface ou SQL como valores independentes.

## 3. Fonte canônica e persistência

A fonte canônica deve ser definida para cada parâmetro ou conjunto de dados antes da implementação de qualquer consumidor.

A escolha do mecanismo deve seguir a natureza da informação:

| Natureza | Persistência/gestão esperada |
|---|---|
| Relações internas, taxas, limites e regras econômicas mutáveis, com vigência e auditoria | Preferencialmente registro versionado em banco de dados, com acesso controlado |
| Cotações e observações de mercado recebidas de provedores | Repositório de dados de mercado/histórico apropriado, preservando fonte, timestamps, tipo de cotação e frescor |
| Configurações de implantação, build e ambiente | Configuração centralizada e versionada, com precedência explícita por ambiente |
| Credenciais, tokens, chaves privadas e segredos | Secret manager ou variáveis protegidas de ambiente |
| Constantes técnicas realmente invariáveis | Código, com classificação explícita e justificativa |
| Documentação | Referência à chave e à fonte canônica; não é cópia operacional concorrente |

A indicação de uma tabela ou serviço como fonte pretendida não comprova sua existência. A fonte runtime só pode ser considerada implementada depois de verificação do schema, controle de acesso, integração, comportamento de atualização e testes no ambiente correspondente.

## 4. Contrato mínimo e ciclo de vida

Cada parâmetro mutável deve ter, conforme aplicável:
- chave estável e descrição semântica;
- domínio, unidade, escala e tipo;
- fonte canônica e escopo;
- valor e versão/identificador;
- estado: rascunho, aprovado, ativo, suspenso ou substituído;
- início e fim de vigência, com fuso horário quando aplicável;
- autor, aprovador, datas e justificativa;
- regras de validação, limites e arredondamento;
- política de cache, propagação e invalidação;
- trilha de auditoria.

Alterações devem criar nova versão ou novo registro de vigência. Não sobrescrever versões que já tenham sido utilizadas por operações.

Dados de mercado também precisam preservar proveniência e temporalidade. Atualizar a cotação corrente não pode apagar o dado anteriormente observado quando esse dado tiver sido utilizado para uma decisão ou transação.

## 5. Registro transacional e preservação histórica

Toda operação que dependa de parâmetros ou preços variáveis deve registrar os elementos necessários para reproduzir e auditar a operação:
- chave e identificador/versão do parâmetro;
- valor aplicado e unidade, ou snapshot imutável equivalente;
- ativo, moeda, quantidades e precisão;
- cotação, tipo de preço, fonte e timestamps, quando aplicável;
- taxa, spread, custos e regra de arredondamento;
- modo de financiamento/prioridade escolhido, quando aplicável;
- contraparte, ordem, execução e liquidação, quando aplicável;
- identificadores correlacionados e estado final.

Alterações posteriores não podem reinterpretar transações antigas. Correções retroativas exigem evento explícito, justificativa, autorização e trilha de auditoria; não podem consistir em sobrescrever o registro original.

## 6. Precisão, unidades e arredondamento

- Valores contábeis não devem usar ponto flutuante binário (`float`) quando isso puder introduzir erro financeiro. Usar inteiros em unidades atômicas ou decimal de precisão definida.
- A escala e a precisão devem ser definidas por ativo e por operação.
- MWN é inteiro e não admite frações, conforme regra registrada na MISSION_0021.
- A apresentação visual não pode alterar o valor contábil. O truncamento visual de quantidades MWN para baixo e a exibição sem casas decimais não autorizam truncar ou descartar saldo no ledger.
- Conversões que produzam resíduos UMS não podem descartá-los silenciosamente. A política de conversão parcial e tratamento de resíduos continua pendente de definição e aprovação antes de operação real.

## 7. Falhas, indisponibilidade e divergências

O consumidor deve distinguir parâmetro ausente, inválido, não aprovado, fora da vigência, desatualizado e indisponível.

Não utilizar fallback silencioso que:
- substitua preço atual por valor antigo sem identificar sua idade;
- troque uma versão aprovada por default hardcoded;
- transforme cotação indicativa em preço executável;
- contorne a fonte canônica;
- altere a interpretação de uma operação já registrada.

Quando não houver informação confiável para uma operação, o comportamento seguro é sinalizar indisponibilidade e bloquear a ação que dependa dela, conforme criticidade e política aprovada. A interface deve identificar claramente dados indicativos, atrasados ou indisponíveis.

## 8. Autoridade e mudança de parâmetros

A autoridade para propor, aprovar e ativar cada classe de parâmetro deve ser definida na governança do domínio correspondente. Não presumir que todo desenvolvedor, administrador técnico, operador de mercado ou provedor de dados tenha autoridade econômica para alterar parâmetros.

Toda mudança deve registrar:
1. parâmetro e versão afetados;
2. valor anterior e novo valor;
3. motivo e evidência;
4. proponente e aprovador;
5. data de aprovação e início de vigência;
6. impacto esperado e plano de reversão, quando aplicável.

Uma alteração de parâmetro não autoriza automaticamente transações reais, integração com terceiros, depósitos, saques, custódia ou execução de ordens.

## 9. Aplicação à rota econômica UMS/MWN

A governança da MISSION_0021 estabelece, entre outras regras:
- a relação interna UMS/MWN é identificada pela chave `UMS_PER_MWN`;
- a aquisição de UMS com moeda fiduciária é distinta de converter UMS de volta para fiat;
- não há conversão direta UMS→fiat nem UMS→ativo externo;
- a rota de recursos originados em UMS para aquisição de ativo externo é UMS→MWN→moeda fiduciária→ativo/token externo;
- os modos de financiamento (UMS-only, fiat-only e híbridos) definem prioridade de consumo, não atalhos de conversão;
- ledgers UMS, MWN e fiat devem permanecer segregados e correlacionados por eventos auditáveis.

Este documento não declara que preços fiduciários, liquidez, contraparte, saldos fiat, depósitos/saques ou execução externa já estejam implementados. Cada capacidade depende de fonte, desenho, controles, conformidade e autorização próprios.

## 10. Critério de aceite para desenvolvimento

Uma implementação que consuma ou altere parâmetros econômicos ou dados de mercado só pode ser aceita quando:
1. cada informação possui fonte canônica identificada;
2. categorias distintas (conversão interna, cotação, preço executável, spread, taxa e limite) não foram confundidas;
3. persistência e segurança correspondem à natureza da informação;
4. não existem cópias operacionais independentes hardcoded;
5. versões, vigências, proveniência e auditoria são preservadas;
6. transações registram os valores/versões efetivamente aplicados;
7. precisão, arredondamento e resíduos estão definidos;
8. falhas, dados ausentes, divergentes e desatualizados têm comportamento explícito;
9. testes cobrem ausência, invalidade, mudança de versão, concorrência, cache e fallback;
10. documentação aponta para as fontes canônicas;
11. implementação, migração e ativação operacional têm gates e aprovações próprios.

## 11. Estado atual do registro

Neste momento, o registro canônico documenta a chave `UMS_PER_MWN` e uma referência econômica já conhecida, mas a fonte runtime versionada indicada ainda precisa ser verificada/implementada. Os valores fiduciários de UMS e MWN, as respectivas fontes de cotação, preços executáveis, spreads e limites econômicos não devem ser presumidos nem preenchidos por inferência: precisam de especificação e aprovação próprias antes de serem registrados como parâmetros ativos.

---

**Documentos relacionados**
- [Diretriz geral de configuração e parâmetros](CONFIGURATION_AND_PARAMETER_GOVERNANCE.md)
- [Registro canônico de parâmetros](parameters/README.md)
- [MISSION_0021 — Blueprint](missions/0021/BLUEPRINT.md)
- [MISSION_0021 — Modelo funcional e econômico](missions/0021/MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md)
- [MISSION_0021 — Contrato de isolamento e ponte](missions/0021/MWEX_ISOLATION_BRIDGE_CONTRACT_21_3.md)
