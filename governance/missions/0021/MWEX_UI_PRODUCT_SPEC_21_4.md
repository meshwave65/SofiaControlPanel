# Especificação de UI — MW-Ex (MISSION_0021)

**Estado:** proposta incorporada ao escopo da missão; implementação visual e validação pendentes.  
**Projeto:** MeshWave / newsite  
**Referência visual:** aplicativo profissional de carteira/exchange mobile-first fornecido pelo responsável em 2026-11-11.

## 1. Objetivo

Evoluir a MW-Ex de uma tela funcional básica para uma experiência de carteira e exchange com padrão visual profissional, hierarquia clara, leitura rápida de saldos e mercado, gráficos e indicadores de movimento. A interface deve priorizar dispositivos móveis, adaptar-se a telas maiores e manter a identidade visual MeshWave.

A referência enviada serve como direção de qualidade visual e composição, não como especificação para copiar uma marca, layout ou ativo de terceiros.

## 2. Direção visual e navegação

- Tema escuro premium, baseado em azul-marinho/preto, superfícies em camadas, gradientes azuis e realces luminosos moderados.
- Tipografia com hierarquia clara; números financeiros com alinhamento e contraste adequados.
- Cartões compactos e consistentes, cantos arredondados, bordas discretas e espaçamento generoso.
- Layout mobile-first, com navegação e ações acessíveis por toque; adaptação para desktop sem simplesmente ampliar a coluna mobile.
- Evitar excesso de informação simultânea, decimais decorativos, animações e elementos que não representem dados reais.

## 3. Painel da carteira

- Saldo MWN em destaque, apresentado como quantidade inteira, sem casas decimais.
- Equivalência potencial em UMS identificada explicitamente como potencial, nunca como saldo UMS disponível.
- Valor fiduciário estimado da carteira somente quando existir cotação MWN/fiat verificável e suficientemente atual; exibir moeda, fonte e horário.
- Não exibir valor fiduciário independente para UMS. Seu valor é derivado da cotação observada de MWN dividida pela versão vigente de `UMS_PER_MWN`.
- Separar visualmente saldo disponível, equivalência potencial, valor estimado e histórico de operações.
- Não alterar valores de ledger, precisão interna, cálculos ou lançamentos para adequar a apresentação visual.

## 4. Mercado e cotações externas

A área de mercado é somente informativa/read-only e não representa habilitação de negociação dos ativos nela exibidos.

Lista inicial de referência, sujeita à confirmação de disponibilidade e adequação das fontes:
- MWN;
- BTC;
- ETH;
- Ibovespa;
- S&P 500;
- IPCA.

Cada indicador, quando suportado por fonte real, deve apresentar:
- valor e moeda/unidade;
- variação percentual e janela temporal explicitada;
- seta e cor para alta, queda ou estabilidade, com limiar neutro definido;
- nome da fonte;
- horário da cotação no provedor e horário de atualização/ingestão;
- estado de frescor: atual, atrasado ou indisponível.

Não selecionar automaticamente uma fonte apenas por conveniência. Provedor, cobertura, limites, termos de uso, frequência, confiabilidade e necessidade de credenciais devem ser avaliados antes da integração. Segredos permanecem no servidor/ambiente protegido.

MWN não deve receber cotação inventada, estimada a partir de UMS ou apresentada como preço de mercado sem fonte verificável. Se não houver mercado externo observável, a interface deve informar indisponibilidade de cotação externa.

## 5. Gráficos

- Exibir gráficos históricos somente quando houver série temporal real, com fonte e período identificáveis.
- Permitir períodos compatíveis com a granularidade e retenção da fonte (por exemplo: 1D, 1W, 1M, 1Y), sem oferecer intervalos que os dados não suportem.
- Não interpolar, sintetizar ou preencher lacunas como se fossem observações reais.
- Quando não houver histórico, mostrar estado vazio informativo, não uma curva ilustrativa que possa ser confundida com cotação.
- Diferenciar gráfico de preço de ativo, evolução de saldo da carteira e indicadores comparativos.

## 6. Operações e histórico

- Preservar os fluxos internos aprovados de conversão UMS↔MWN e transferência MWN entre participantes elegíveis.
- Manter ações de operação claramente separadas de cotações e gráficos.
- Antes da confirmação, informar ativo, quantidade, origem/destino e resultado esperado, preservando a precisão efetiva exigida pelo contrato.
- Histórico deve apresentar tipo, quantidade, data/hora e estado. Quantidades MWN são inteiras; a precisão contábil UMS não pode ser alterada pela camada de apresentação.
- Nenhuma tela de cotação ou botão visual deve sugerir compra/venda externa, saque, depósito fiat ou liquidez que não esteja implementada e autorizada.

## 7. Regras de apresentação numérica

- Quantidades MWN são sempre inteiras e não exibem casas decimais.
- A camada visual não arredonda nem altera os valores do ledger.
- A precisão interna de UMS permanece integral. A política de apresentação resumida de UMS deve evitar poluição visual sem ocultar informação necessária para confirmar ou auditar uma operação.
- Preços fiduciários, variações percentuais, taxas e indicadores conservam as casas decimais tecnicamente necessárias à leitura correta; a regra de saldo inteiro não deve ser aplicada indiscriminadamente a preços ou percentuais.
- Valores grandes podem usar abreviação visual (K/M/B) somente quando a representação exata permanecer acessível em contexto de detalhe.

## 8. Segurança, integridade e acessibilidade

- UI não substitui autorização server-side nem políticas de dados.
- Dados externos são tratados como não confiáveis e nunca podem alterar saldo/ledger.
- Erros, atraso de feed, indisponibilidade e estado de carregamento devem ser visíveis e compreensíveis.
- Indicadores não dependem apenas de cor: setas, sinais e texto também comunicam alta/queda/estabilidade.
- Contraste, foco, rótulos, áreas de toque e navegação por teclado devem ser verificados.

## 9. Fases de implementação

1. **Fase visual e de apresentação:** redesenhar a estrutura e os componentes da MW-Ex, aplicar a regra de quantidade inteira MWN, remover referências estáticas que possam parecer cotação real e preservar os fluxos atuais.
2. **Fase de dados de mercado:** selecionar e validar provedores; integrar cotações externas read-only com proveniência, frescor e tratamento de falhas.
3. **Fase de gráficos e indicadores:** exibir variações, setas e séries históricas apenas depois de existir fonte e histórico reais.
4. **Validação:** testes responsivos, acessibilidade, precisão numérica, regressão dos fluxos de carteira e conferência de que dados externos não afetam lançamentos.

Cada fase deve produzir evidência verificável e ser registrada em Operational Report. Não declarar a UI completa enquanto dados de mercado ou gráficos estiverem representados apenas por placeholders.

## 10. Fora de escopo

- Trading externo, execução de ordens, listagem, depósito/saque, fiat ou promessa de liquidez.
- Cotação artificial ou preço independente de UMS.
- Dados de mercado simulados apresentados como reais.
- Alteração de tokenomics, ledger, saldos ou regras de conversão motivada apenas por conveniência visual.


## 11. Provedores de dados e proveniência — atualização 2026-11-12

A primeira integração read-only foi estruturada com um endpoint server-side `GET /api/market-data`, com cache compartilhado de 60 segundos. As chaves dos provedores devem permanecer em variáveis de ambiente server-side do Vercel; nunca usar prefixo `VITE_` para segredos.

| Ativo / indicador | Fonte prevista | Observação |
|---|---|---|
| BTC / ETH | CoinGecko API | Cotação em BRL, variação de 24h, timestamp e atribuição visível. Demo key recomendada para estabilidade e limites previsíveis. |
| Ibovespa / S&P 500 | HG Brasil Finance API | Tickers `INDEXB3:IBOV` e `INDEXNYSE:SPX`; cotação, variação e timestamp. Chave interna server-side. |
| IPCA | Banco Central do Brasil — SGS, série 433 | Indicador mensal oficial; não é ativo negociado nem cotação intradiária. Comparação com mês anterior deve ser descrita como aceleração/desaceleração da inflação, não alta/queda de preço de ativo. |
| MWN | Nenhuma fonte pública confirmada | Não apresentar preço externo até existir mercado e fonte verificáveis. |
| UMS | Derivação econômica | Não possui cotação fiduciária independente. Valor implícito = cotação MWN/fiat ÷ UMS_PER_MWN vigente. |

Variáveis server-side:
- `COINGECKO_DEMO_API_KEY` — opcional para consulta pública inicial; recomendada para uso estável.
- `HG_BRASIL_API_KEY` — necessária para as cotações de índices.

Estado da implementação nesta atualização:
- Endpoint server-side criado e normaliza os dados dos três provedores.
- A MW-Ex consulta o endpoint e atualiza a cada 60 segundos.
- A UI exibe preço/indicador, variação, fonte e timestamp/referência quando disponíveis.
- Sem chave HG Brasil, os índices permanecem explicitamente indisponíveis; sem feed de histórico, os gráficos permanecem vazios.
- As chaves ainda precisam ser cadastradas no ambiente de produção Vercel e o endpoint precisa ser validado com respostas reais de cada provedor.
