# MISSION_0014 — Auditoria de notebooks e evidências de execução (checkpoint)

**Data:** 2026-10-30  
**Tarefa primária:** 14.1 — PROGRESS  
**Escopo:** inspeção estática de notebooks versionados no branch `main` do repositório `meshwave65/Multiflow-Turbulence`, HEAD `e70572322f9c67ceb7daa9d47729b2b98d07f8f0`.  
**Execução de código:** não realizada; outputs já armazenados nos notebooks foram inspecionados como evidência documental, não reproduzidos.

## 1. Regras de leitura

- `execution_count` e outputs salvos indicam que uma célula foi executada em algum momento, mas não demonstram que a execução corresponde ao commit atual, que o ambiente é reproduzível ou que o output não foi alterado.
- Notebook com `execution_count=null` e sem outputs não é evidência de execução concluída.
- Pastas e nomes de arquivo não são aceitos como fonte da resolução; a variável de configuração no código é a referência primária.
- Checkpoints de 72 bytes foram identificados como artefatos vazios/minimalistas e não devem ser contados como experimentos adicionais.

## 2. Resultados observados por notebook

### 2.1 HIT 64³ — `01_decomposicao_instantanea.ipynb`

- Código configura `N=64`, `K_CLUSTERS=12`, seed fixa e calcula invariantes `|ω|`, Q e λ₂, com análise de cortes volumétricos.
- A célula tem `execution_count=10` e output de execução salvo.
- O notebook é uma prova de conceito sintética; não usa DNS/experimento físico.
- Como KMeans fixa k=12, `N_eff` por contagem de clusters acima de um limiar não estabelece emergência independente de 12.

### 2.2 Notebook em `output_multiflux_64/Untitled1.ipynb` — resolução real 192³

- O caminho da pasta sugere 64, mas o código declara explicitamente `N=192`, `DS=4`, `K_CLUSTERS=12`.
- Output salvo reporta KMeans em 110.592 amostras (48³) e `N_eff=12`.
- O código calcula `K2 += 1e-30` antes de `K=sqrt(K2)`; depois define `mask=K2>0`. Isso inclui o modo zero no escalonamento espectral `K^{-5/6}`. Como (K_0\approx10^{-15}), o modo zero recebe amplitude artificialmente enorme; a projeção solenoidal não remove esse modo, pois o vetor de onda é zero.
- O output reporta energia cinética média `9.537250e+17`, valor compatível com contaminação numérica do modo zero. A explicação é uma inferência fortemente sustentada pelo código e output; ainda requer reprodução isolada para confirmar magnitude.
- Portanto, o output N_eff=12 desse notebook não pode ser tratado como evidência robusta até corrigir e repetir o ensaio.

### 2.3 Multiflux v2.0 — resolução 256³

Arquivo: `output_multiflux/output_multiflux_2_0_Euler-Lagrange/Eulerian–Lagrangian Integrated Test_256.ipynb`

- Código declara `N=256`, `K_CLUSTERS=12`, seed 42 e tem `execution_count=2), outputs e tabela de 12 clusters.
- O campo de velocidade é gerado por amplitudes aleatórias complexas e projeção solenoidal; **não há no código lido escalonamento por shells para impor o espectro Kolmogorov (k^{-5/3})**.
- Features de clustering são somente magnitude da velocidade e soma dos gradientes ao quadrado; não são o triplo de invariantes (|ω|,Q,λ₂).
- `N_eff` é calculado contando clusters com volume ≥0,5%, mas KMeans foi instruído com `n_clusters=12`; a tabela reporta todos os 12 acima do corte.
- A quantidade chamada `L_eff) é calculada como `KE - DISS`, em que KE é energia cinética média e DISS é soma de gradientes ao quadrado. O código não explicita viscosidade, densidade, escala dimensional ou normalização que demonstre compatibilidade dimensional entre os termos.
- Não há, nesse notebook, cálculo explícito de variação da ação, equações de Euler–Lagrange, evolução temporal Lagrangiana ou comparação com solução variacional. É uma análise estatística de clusters e proxies, apesar do título “Variational Validation”.
- Conclusão: output existente comprova que a célula executou um pós-processamento para campo sintético aleatório com k=12; não comprova, por si, validação variacional ou regularização de Navier–Stokes.

### 2.4 Multiflux v2.0 — resolução 384³

Arquivo: `output_multiflux/output_multiflux_2_0_Euler-Lagrange/Eulerian–Lagrangian Integrated Test_384.ipynb`

- Código declara `N=384`, `K_CLUSTERS=12`, `VOLUME_CUTOFF=0.005`; célula tem `execution_count=1`.
- Há tentativa de escalonamento por shells, mas a função de clustering usa uma única feature construída como:
  `sqrt(grad_mag2(w) - grad_mag2(v) + grad_mag2(u))`.
- Essa expressão não é a magnitude da vorticidade (que exige diferenças cruzadas dos gradientes) nem o critério Q. A subtração pode tornar o radicando negativo; o output salvo contém `RuntimeWarning: invalid value encountered in sqrt`.
- O código reporta como `N_eff` o número de labels únicos, sem aplicar o `VOLUME_CUTOFF` configurado.
- A saída de `np.savetxt(..., results)` recebe um dicionário Python; não há output salvo demonstrando que o trecho de persistência terminou com sucesso.
- Conclusão: a célula foi iniciada/executada, mas a evidência armazenada indica erro numérico e não demonstra uma validação completa em 384³.

### 2.5 HIT otimizada 384³ — `output_multiflux/multiflux_384.ipynb`

- Código declara `N=384`, `K_CLUSTERS=12`, `DS=4); execução salva tem output de conclusão.
- Gera campos sintéticos por FFT, aplica escalonamento espectral aproximado, projeção solenoidal, calcula invariantes na malha reduzida `96³` e usa quatro features: vorticidade, Q, λ₂ e helicidade.
- KMeans é `MiniBatchKMeans(n_clusters=12)`; `N_eff) é número de clusters com volume >0,5%.
- Output reporta `N_eff=12`, com 884.736 amostras de features (96³).
- Outputs mostram warnings de divisão por zero em `K^{-5/6}` e `1/K²` via `np.where`. O zero mode deve ser excluído por máscara explícita antes de aplicar potência/divisão, evitando que a avaliação eager das expressões gere warnings; verificar que o modo zero permanece nulo.
- A grade do campo é 384³, mas a identificação de clusters é feita em 96³ por downsampling DS=4. Logo, não é uma decomposição/clusterização ponto a ponto de 384³; a distinção deve constar em qualquer claim de resolução.
- Output salvo é evidência de execução histórica; a execução não foi reproduzida neste trabalho.

### 2.6 HPC stress test 512³

Arquivo: `output_multiflux/sciserver_stress_tests/notebooks/multiflux_hpc_stress_test.ipynb`

- Código configura `N=512`, `DS=4), `K_CLUSTERS=12).
- `execution_count=null`; output termina após geração do campo e cálculo de energia cinética.
- Não há output de gradientes, clustering, N_eff ou arquivo final. O arquivo é um script preparado para 512³, não evidência de execução completa em 512³.
- O valor de N_eff=12 em 512³ citado em discussões externas não é comprovado por este notebook versionado.

### 2.7 Tentativa de dados JHTDB — notebook sob pasta 32

Arquivo: `output_multiflux/output_multiflux_32/Untitled.ipynb`

- Apesar da pasta `output_multiflux_32`, o código configura `NX=128`, dataset `isotropic1024_fine`, snapshot `T=5.0).
- A célula tem output explícito: “This script is a template”, solicita obtenção manual dos dados no JHTDB e informa que `src/analysis/jhtdb/isotropic1024_fine_center_128c_t5.00.h5` não foi encontrado.
- O cliente JHTDB está comentado/placeholder. O notebook não representa validação em dados DNS obtidos; é um template para baixar/processar um cubo de 128³, ainda sem arquivo de dados.

### 2.8 Ethier–Steinman — alegada validação do solver

Arquivo: `src/decomposition/results/ethier_validation/ethier_steinman_comparativo.ipynb`

- Output salvo anuncia malhas 16³, 32³ e 64³.
- Porém a função `run_my_solver` está explicitamente marcada como “EXEMPLO FICTÍCIO (substituir pelo seu solver real)” e retorna erros sintéticos calculados por fórmula `erro_base * exp(-0.5*tempos) + 1e-8`.
- Não existe execução de solver de Navier–Stokes nesse notebook; o gráfico de erro é gerado a partir de dados artificiais.
- Conclusão: não é validação do solver nem teste de convergência de uma implementação Multiflux. O próprio código declara ser placeholder.

### 2.9 Voronoi/Bayes — validação variacional

Arquivo: `output_multiflux/output_multiflux_voronoi/Variational Validation Plots for Multiflux Theory v2.0.ipynb`

- Notebook contém outputs gráficos e texto com `N_eff=12`, correlação volume–dissipação = -0,7638925611689907 e volume–ação = 0,7638731880677117.
- A célula de código principal está vazia; não há procedimento computacional recuperável no notebook atual para reproduzir os números.
- É necessário localizar o script/notebook-fonte ou o dataset que produziu os outputs antes de tratar as correlações como reproduzíveis.

## 3. Resoluções efetivamente identificadas neste conjunto

| Valor / escala | Evidência no repositório | Interpretação auditada |
|---|---|---|
| 32 | Nome de diretório `output_multiflux_32`; código configura `NX=128` | Não é execução 32³; é template JHTDB para cubo 128³ |
| 64 | `01_decomposicao_instantanea.ipynb` | HIT sintética com código executado/output |
| 128 | Mesmo template JHTDB, `NX=128` | Dados ausentes; não validado |
| 192 | Notebook sob pasta `output_multiflux_64` | HIT sintética executada, mas modo zero contaminado; N_eff inválido até corrigir |
| 256 | Notebook v2.0 Euler-Lagrange | Campo sintético sem espectro Kolmogorov imposto; KMeans k=12; análise estatística, não validação variacional |
| 384 | Dois notebooks diferentes | HIT otimizada com downsampling para 96³ e outputs; outro v2.0 tem radicando inválido e execução incompleta |
| 512 | HPC stress test | Script configurado; sem execução completa/resultado N_eff salvo |
| 768 | Alegação em manuscrito Zenodo | Nenhum notebook/artefato correspondente localizado no branch main inspecionado |
| 912 | Declaração do responsável | Nenhum notebook/artefato correspondente localizado no branch main inspecionado |
| 324 | Declaração do responsável | Nenhum notebook/artefato correspondente localizado no branch main inspecionado |

## 4. Implicações para a matriz de evidências

- A existência de output salvo não equivale a reprodução independente.
- Os resultados `N_eff=12` nos notebooks com KMeans fixo devem ser classificados como “resultado computacional histórico condicionado a k=12”, não como evidência de emergência espontânea de 12 subfluxos.
- Há problemas de geração espectral/zero mode no notebook 192³, feature inválida no notebook 384³ v2.0, ausência de solver no benchmark Ethier–Steinman e ausência de dados DNS no template JHTDB.
- O notebook 384³ otimizado é o candidato mais completo de execução HIT no repositório atual, mas ainda é sintético, com downsampling 4× por dimensão para clustering e k fixo.
- Não foram alterados notebooks, scripts, PDFs, datasets ou simulador.

## 5. Próximas verificações

1. Obter os outputs externos SciServer alegados para 512³ e 768³, com logs e arquivos de resultado.
2. Localizar os experimentos 324 e 912 citados pelo responsável, sem assumir que sejam dimensões cúbicas.
3. Identificar a origem dos outputs do notebook Voronoi/Bayes e seus dados.
4. Revisar matematicamente a projeção espectral e a normalização por shells em cada script antes de qualquer reexecução.
5. Construir ambiente reprodutível em branch isolada apenas após autorização/tarefa de reprodução; não corrigir os artefatos originais nesta auditoria.
