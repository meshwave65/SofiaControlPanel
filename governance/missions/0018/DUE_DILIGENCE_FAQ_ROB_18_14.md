# MISSION_0018 / 18.14 — Pacote de diligência e FAQ ROB

**Versão:** 0.5-DRAFT | **Data:** 2026-11-10  
**Base textual:** master ROB v0.5.7; matriz 18.1; tarefas 18.2–18.8; auditoria 18.11; framework 18.12; derivados 18.13.

**Sincronização:** atualizado para master ROB v0.5.7, preservando MWN-first e incorporando o estado operacional da MW-Ex como MVP custodial interno.  
**Status:** pacote interno; sem autorização para envio externo.

## 1. Rota de leitura
1. EXECUTIVE_DERIVATIVES_ROB_18_13.md — resumo executivo.
2. ROB_INVESTOR_MATERIAL_MASTER.md — tese completa e riscos.
3. EVIDENCE_MATRIX_18_1.md — fontes e limites por componente.
4. CLAIM_EVIDENCE_AUDIT_18_11.md — limites de linguagem e lacunas.
5. ARCHITECTURA_ECONOMICA_UMS_MWN_DECISION_DRAFT.md — arquitetura e decisões econômicas.
6. ESTRATEGIA_MERCADO_E_LISTAGEM_18_3.md — estratégia própria e opções externas.
7. MWEX_MVP_SCOPE_OPERATION_READINESS_18_4.md — escopo e gates de mercado.
8. PORTFOLIO_STRATEGIC_SUBMISSIONS_18_5.md — frentes do ecossistema.
9. RISK_AND_COMPLIANCE_MATRIX_18_6.md — riscos.
10. ROADMAP_INTEGRATED_PHASES_GATES_18_7.md — sequência e dependências.
11. CAPITAL_PARTICIPATION_FRAMEWORK_18_12.md — alternativas sem instrumento escolhido.
12. THESIS_MWN_ROB_18_8.md e EXECUTIVE_SUMMARY_MWN_ROB_18_8.md — tese detalhada e executiva anteriores.

## 2. FAQ preliminar
**Qual é o objeto central desta proposta ROB?** MWN, o ativo de mercado da economia MeshWave. O ecossistema MeshWave é a base tecnológica e econômica que fundamenta a tese da MWN; não é um catálogo de produtos independentes que se pretende vender ao investidor.

**Qual é o papel do ecossistema MeshWave?** Dar contexto, estrutura e possibilidades de utilidade à MWN por meio de serviços, aplicações, infraestrutura distribuída e mecanismos internos de contabilização e participação. Os componentes são apresentados como fundamento da tese do ativo, não como ofertas separadas.

**O que significa ROB?** Return On Believe — retorno por acreditar. É a denominação da tese de investimento e não uma métrica financeira padronizada, ROI, valuation ou promessa de retorno.

**Como se relacionam UMS e MWN?** UMS é a unidade interna de contabilização de contribuição útil e consumo de serviços. MWN é o ativo que conecta essa economia interna à circulação externa. A arquitetura define MWN como gateway asset: a conversão entre o ambiente UMS e a camada de mercado ocorre por meio de MWN. A MW-Ex já funciona como exchange própria para operações internas; não há rota direta UMS↔outro criptoativo.

**Como surge a procura recorrente por MWN?** Serviços e atividades do ecossistema utilizam UMS. Quando um participante precisa de novas unidades além do saldo disponível, o caminho econômico previsto é adquirir MWN no mercado e convertê-la em UMS. Isso conecta a atividade interna à procura pela MWN: o uso efetivo e contínuo dos serviços alimenta a necessidade de UMS e, por consequência, o caminho de aquisição e conversão por MWN.

**Por que buscar recursos agora?** Para consolidar a arquitetura econômica e a infraestrutura que sustentam a MWN, aperfeiçoar os componentes da base MeshWave, avançar a MW-Ex e ampliar os recursos materiais, computacionais, financeiros e humanos necessários à evolução do ativo e de seu ecossistema.

**A MeshWave já está em produção?** É necessário distinguir os componentes do ecossistema integrado. SOFIA, AppAndroid, SWE e Condenser são funcionais; MIA-D já possui estrutura mínima de medição e avaliação. A operação conjunta do ecossistema ainda é rudimentar e sua integração e escala precisam avançar. Funcionalidade de componentes não significa que todas as frentes estejam integradas em uma única operação madura.

**A MW-Ex já funciona?** Sim. Está operacional em modalidade interna como MVP custodial. Possui carteira MWN com ledger separado da carteira UMS, conversões explícitas UMS↔MWN, transferências internas entre usuários elegíveis, histórico de operações, créditos administrativos mediante referência de depósito e validação, e reversões administrativas por lançamentos compensatórios que preservam o histórico. A rota /mw-ex exige autenticação, a elegibilidade é verificada no servidor e as operações de backend são executadas por RPCs Supabase. Esse escopo não inclui listagem em exchange externa, saques automáticos ou movimentação financeira automatizada para fora do ecossistema.

**O que são UMS e MWN?** UMS é a unidade interna de contabilização de contribuição útil e consumo de serviços. MWN é o ativo de mercado e gateway da economia MeshWave, conectando o ambiente interno à circulação externa. A arquitetura não prevê rota direta UMS↔outro criptoativo; a conexão com o mercado ocorre por MWN, com a MW-Ex já operacional como canal próprio para operações internas. Direitos, supply, emissão, Genesis e parâmetros finais de conversão ainda dependem de aprovação.

**Já existe blockchain pública ou rede descentralizada?** A evidência revisada classifica o ledger/blockchain como piloto single-operator e non-canonical. Não há comprovação de rede pública distribuída em produção com consenso independente.

**Há usuários, clientes, receita ou investidores confirmados?** O pacote revisado não contém comprovação suficiente para declarar adoção comercial, receita recorrente, investidores interessados ou compromissos de parceria. Tentativas de contato não provam interesse.

**Quais sistemas já são funcionais?** SOFIA é um sistema funcional de orquestração de inteligências artificiais. AppAndroid é uma aplicação Android funcional que atua como frontend do SOFIA Core. SWE é um módulo funcional de captura e extração de conhecimento. Condenser é um sistema funcional de condensação e otimização. MIA-D já possui uma estrutura mínima de medição e avaliação. Esses componentes ainda podem ser rudimentares e demandar aperfeiçoamento, integração, otimização e escala; isso não elimina sua funcionalidade atual.

**O que é MIA-D?** É uma estrutura mínima já existente de medição e avaliação, acompanhada de metodologia em evolução para avaliar impactos associados a operações digitais. Não se limita à contabilidade de carbono. No desenho integrado do JEd, os metadados gerados pelas otimizações do Condenser alimentam o MIA-D, que deverá oferecer análises individuais, empresariais e agregadas por regiões, países e segmentos. A consolidação metodológica e a ampliação das medições são etapas de evolução; não se deve confundir estrutura existente com certificação ou validação científica independente.

**O que é o JEd?** Jardim do Éden (JEd) é concebido como plataforma que integra experiência de jogo baseada no SimCity clássico, economia interna em UMS, Condenser em segundo plano, MIA-D e distribuição do módulo de interconexão MeshWave. O módulo será disponibilizado em atualização futura e só será ativado mediante autorização expressa. A plataforma integrada e seus canais de patrocínio ainda fazem parte da evolução planejada.

**Os 750 mil usuários do JEd já existem?** Não. É um cenário potencial estimado pelo fundador, equivalente a aproximadamente 5% da referência histórica de mais de 15 milhões de downloads do SimCity clássico. Não representa usuários atuais, migração realizada ou adoção confirmada.

**Como alguém se torna MeshWalker?** Apenas após escolher e autorizar expressamente a ativação do módulo de interconexão. Para quem adere como MeshWalker, a regra-base prevê contribuição de 1% da capacidade de processamento e 1% da capacidade de armazenamento do equipamento; capacidade adicional é opcional. A comercialização dessa capacidade a terceiros é objetivo do modelo de rede, não deve ser apresentada como serviço comercial já em produção.

**Já existem patrocinadores ou parceiros do JEd?** Os exemplos de marcas, estruturas patrocinadas, campanhas e integrações com Software Houses ilustram modelos comerciais possíveis. Não representam contratos, patrocínios ou parcerias firmados.

**Quais valores estão sendo considerados?** Faixas estratégicas relatadas de R$ 50 mil–R$ 100 mil na etapa inicial, R$ 250 mil–R$ 500 mil para acesso externo futuro e alguns milhões para escala futura. Não são orçamento aprovado, valuation, projeção ou compromisso.

**Qual instrumento o investidor receberia?** Ainda não foi escolhido. Participação societária, mútuo/conversível, SAFE/equivalente, parceria, financiamento por marcos, grants ou instrumento digital são alternativas para análise profissional; nenhuma foi selecionada.

**A Binance aprovou a listagem?** Não há aprovação confirmada. Segundo declaração do fundador, houve candidatura histórica; o status atual não foi verificado. Nenhuma exchange externa foi selecionada.

**Há garantia de retorno, valorização ou liquidez?** Não. Existe risco elevado, inclusive de perda integral do capital. ROB não representa retorno garantido, preço-alvo ou ROI.

## 3. Checklist de diligência
- [ ] Confirmar entidade e titularidade de ativos/IP.
- [ ] Conferir repositórios, branches, commits e licenças relevantes.
- [ ] Revalidar portal, wallet, ledger e fluxos em ambiente controlado.
- [ ] Revisar arquitetura UMS/MWN e decisões pendentes.
- [ ] Inspecionar escopo e readiness real da MW-Ex.
- [ ] Avaliar cadeia, custódia, gestão de chaves e segurança por especialistas.
- [ ] Reexecutar benchmarks SWE/Condenser e avaliar preservação semântica.
- [ ] Validar MIA-D com instrumentos, dados e revisão técnica.
- [ ] Confirmar orçamento, runway, equipe e marcos da primeira etapa.
- [ ] Obter análise jurídica, regulatória, tributária e de compliance.
- [ ] Definir instrumento, valuation, direitos e governança somente após assessoria.
- [ ] Confirmar mercados/jurisdições e contraparte antes de qualquer venue.

## 4. Links públicos e contato

- Apresentação para investidores: https://www.meshwave.com.br/investidores
- Estado do projeto: https://www.meshwave.com.br/estado-do-projeto
- MW-Ex: https://www.meshwave.com.br/mw-ex
- E-mail institucional: [info@meshwave.com.br](mailto:info@meshwave.com.br)
- WhatsApp — Brasil: [+55 21 97234-1965](https://wa.me/5521972341965)
- WhatsApp — Portugal: [+351 914 845 439](https://wa.me/351914845439)

Os canais acima correspondem aos contatos publicados na página institucional de contato da MeshWave.

## 5. Resultado
**18.14 atualizada para master v0.5.7.** A rota documental e as respostas foram sincronizadas, inclusive o status operacional da MW-Ex e os canais institucionais de contato. Permanecem como gates para circulação externa: concluir revisão/aprovação do fundador e obter autorização específica de distribuição.
