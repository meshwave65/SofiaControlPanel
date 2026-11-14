# MISSION_0014 — Leitura inicial dos PDFs primários

**Data:** 2026-10-30  
**Tarefa:** 14.1 — em execução  
**Estado:** leitura parcial; nenhum resultado reproduzido.

## 1. PDFs efetivamente lidos nesta etapa

### 1.1 Zenodo 17887596 — Multiflux Theory: Numerical Evidence from Synthetic HIT Fields

PDF: `Instantaneous_Multiflux_Decomposition_in_Synthetic_Turbulence__Evidence_from_Multi_Resolution_Spectral_HIT_Fields.pdf`

Observações extraídas do texto integral:
- Campos HIT sintéticos gerados espectralmente com coeficientes de Fourier aleatórios, espectro (k^{-5/3}) e projeção solenoidal.
- Gradientes espectrais usados para calcular (|ω|), Q e (lambda_2).
- Os três invariantes são padronizados e submetidos a K-means com `k=12`.
- `N_eff` é definido como o número de clusters com fração de volume superior a 0,5%.
- Tabela reporta `N_eff=12` em 64³, 128³, 192³, 256³ e 384³.
- A análise de sensibilidade menciona cortes de 0,1–2,0%.

**Questão metodológica:** como o K-means recebe `k=12`, `N_eff` é limitado superiormente a 12. A observação de 12 clusters acima do limiar demonstra que todos os clusters impostos são maiores que o corte, não que 12 tenha sido selecionado independentemente pelo campo. A estabilidade com resolução não remove essa dependência do parâmetro. O teste adequado deve variar `k`, usar critérios independentes de seleção e medir estabilidade/replicabilidade fora de campos sintéticos.

### 1.2 Zenodo 17888128 — Numerical Evidence for Instantaneous Multiflux Decomposition in Synthetic Turbulence Fields

PDF: `Numerical_Evidence_for_Instantaneous_Multiflux_Decomposition_in_Synthetic_Turbulence_Fields.pdf`

Observações:
- Declara cinco resoluções: 32³, 64³, 192³, 256³ e 384³.
- Abstract relata `N_eff` entre 11 e 12 para cortes de 0,1–2,0%.
- A seção de metodologia contém marcadores editoriais não resolvidos: `[Your text]`, “Describe FFT-based construction”, “Brief description of...” e “Here indicamos”.
- O PDF afirma que a tabela CSV completa está em `src/analysis/clustervolumescomparison.csv`; essa rota não aparece na árvore de 290 blobs consultada no branch `main`.
- A seção de validação independente ainda propõe JHTDB como trabalho futuro.

**Estado:** o PDF é um proof-of-concept incompleto, não um relatório técnico final plenamente especificado. A correspondência com ResearchGate publication 399025958 é provável pelo título, mas ainda requer confirmação documental.

### 1.3 Zenodo 18174808 — Mathematical Foundations of Multiflux Theory (janeiro de 2026)

PDF: `Mathematical_Foundations_of_Multiflux_Theory (2).pdf`

Observações:
- Afirma formulação v2.0 com subfluxos coerentes finitos (`N_eff≈12`), princípio da ação mínima, operador de projeção, força inter-subfluxo, balanço de energia, equação reduzida para `N(t)` e lei CRT com expoente 0,62.
- Decomposição apresentada como (u(x,t)=sum_k u_k(x,t)\chi_k(x,t)), com indicadores de cluster.
- A força inter-cluster é apresentada como termo residual ao projetar Navier–Stokes em cada região.
- A evolução de `N(t)` é apresentada como equação fenomenológica com parâmetros `α`, `β` e `N_eq≈12`.
- O PDF declara convergência até 768³ e disponibilização de dados/notebooks no repositório.
- A justificativa molecular dos subfluxos é apresentada como hipótese de correlação de momento entre moléculas que propaga coerência para escalas maiores.

**Pontos a auditar:** derivação rigorosa da projeção, termos de interface/distribucionais quando `χ_k` muda no espaço/tempo, conservação de massa e momento por subfluxo, fechamento do termo inter-subfluxo, origem/identificabilidade de `N_eq), derivação dos parâmetros e da lei CRT, evidência real de 768³ e reprodutibilidade independente. A expressão “rigorous physical regularization” é uma alegação do manuscrito, não prova matemática de regularidade global.

### 1.4 Zenodo 17958842 — Variational Validation of Multiflux Theory v2.0

PDF: `Variational_Validation_of_Multiflux_Theory_v2_0.pdf`

Observações:
- Relatório descreve um teste em N=256³.
- `N_eff=12` para corte >0,5%.
- Ação efetiva definida como KE menos dissipação; afirma correlação negativa entre volume e dissipação e positiva entre ação e volume.
- O relatório conclui com “Next steps: N=384³ on cloud resources and real DNS validation”.

**Divergência cronológica a resolver:** este relatório de dezembro de 2025 ainda coloca N=384³ e DNS real como próximos passos; o manuscrito de janeiro de 2026 afirma convergência até 768³. Pode ter havido trabalho posterior, mas os dados e notebooks 512–768 devem ser localizados e associados a execuções reproduzíveis.

### 1.5 Zenodo 17933779 — Multiflux Theory Version 2.0

PDF: `Integrating_Lagrangian_and_Eulerian_Approaches_via_the_Principle_of_Least_Action_2_0.pdf`

Observações:
- Apresenta `L_k = ∫_{V_k} [½ρ|u_k|² − p_k − ν|∇u_k|²] dV` como Lagrangiana efetiva.
- Afirma que equações de Euler–Lagrange produzem comportamento laminar local.
- Afirma que a ação total soma ações de subfluxos e interação finita.
- A exposição não fornece, no texto lido, a derivação variacional completa, condições de contorno/interfaces móveis, tratamento da incompressibilidade como restrição ou demonstração de que os termos de interação regularizam o problema de Navier–Stokes.

**Divergência de licença:** metadados Zenodo indicam `CC BY-NC-ND 4.0`, mas o PDF declara `CC BY-NC-SA 4.0`. Deve ser resolvida antes de reutilização, distribuição ou proposta comercial.

### 1.6 Zenodo 17933215 — Variational Formulation of Multiflux Theory

PDF: `Integrating_Lagrangian_and_Eulerian_Approaches_via_the_Principle_of_Least_Action.pdf`

Observações:
- Apresenta a decomposição (u=\sum_k \chi_k u_k), afirma `N_eff=12` em 32³–384³ e introduz ação por subfluxo.
- Escreve (L_k=\int_{V_k}(½ρ|u_k|²-p_k)dV-ν\int_{V_k}|∇u_k|²dV).
- Afirma que as equações de Euler–Lagrange reproduzem comportamento laminar local, sem detalhar no texto extraído a derivação e as condições de interface.
- Liga a regularização ao regime Pre-CRT e ao colapso `N_eff→1`, sem demonstrar nesse documento uma prova de regularidade global.

### 1.7 Zenodo 17659876 — Turbulence as Multiflux (versão inicial)

PDF: `Turbulence_as_Multiflux_Unified_Framework___Paper_1_v2.pdf`

Observações:
- Define `u=Σ_{i=1}^{N(t)}u_i`, com `N(t)≈10³–10⁵` em escoamentos típicos de parede.
- Declara duas hipóteses: supressão de subfluxos transversais em velocidades extremas e arrasto molecular granular.
- Resultados de redução de atrito (45–62%) são obtidos em canal de parede com POD e supressão artificial de velocidade transversal.
- O próprio documento reconhece não unicidade e alta inércia do clustering, limitando seu uso como decomposição física fundamental.
- O plano de validação futuro inclui reprodução DNS baseline, POD/DMD, testes de estabilidade de clustering, rastreamento de coerência lagrangiana, experimentos de supressão e LES industrial.

**Diferença de regime/definição:** o `N(t)≈10³–10⁵` desta versão refere-se a subfluxos hipotéticos em escoamentos de parede; o `N_eff≈12` posterior refere-se a clusters de invariantes em HIT sintética. Não são diretamente comparáveis sem uma definição comum e escala física explícita.

### 1.8 Zenodo 17582481 — Turbulence as Multiflux: A New Conceptual Perspective

PDF: `Turbulence_as_Multiflux_Unified_Framework_pdf.pdf`

Observações:
- Define a soma de subfluxos locais e afirma que cada componente satisfaz Navier–Stokes em domínio local.
- Propõe K-means e Voronoi para identificação e construção de domínios.
- Expande o termo convectivo em termos internos e cruzados e afirma que os termos cruzados seriam a única fonte de transferência de energia entre escalas.
- Inclui hipóteses de supressão por alta velocidade e arrasto molecular granular.
- A justificativa matemática de que os termos cruzados são a única fonte de transferência entre escalas e de que a supressão decorre do alinhamento ainda exige derivação/controle dimensional e confronto com balanços de energia e resultados estabelecidos.

**Divergência de licença:** metadados do record indicam `CC BY-NC 4.0`, diferente da licença CC BY-NC-SA declarada em outros documentos do mesmo projeto. Requer reconciliação.

## 2. Contradições e testes imediatos a registrar

1. **N imposto vs N emergente:** K-means com k=12 e `N_eff` definido como contagem de clusters acima de um corte não prova, por si, emergência independente de 12 estruturas.
2. **32³–768³ vs dados presentes:** artigos variam entre 32³–384³ e 32³–768³; o repositório visível mostra notebooks nomeados até 384³ e imagens de stress test 512³, sem artefato 768³ encontrado.
3. **DNS real:** o relatório 17958842 ainda aponta validação em DNS real como próxima etapa; o artigo 17887596 também aponta JHTDB como trabalho futuro.
4. **N(t)≈10³–10⁵ vs N_eff≈12:** definições e domínios diferentes; não unificar sem uma ponte matemática e operacional.
5. **Formalismo variacional:** as versões v2.0 afirmam derivação e regularização, mas os textos lidos não demonstram ainda a derivação completa, especialmente termos de interface, restrições e fechamento.
6. **Licenças:** 17958842 e 17933779 apresentam divergência Zenodo/PDF; 17582481 usa licença distinta de outros registros.
7. **Reprodutibilidade do paper HIT:** há marcadores de edição e caminho CSV referido no PDF não encontrado na árvore GitHub inspecionada.

## 3. Próximos arquivos a ler

- Os PDFs completos restantes dos 33 registros Zenodo, começando pelos que tratam de HIT, formalização e versões matemáticas.
- PDFs suplementares e relatórios do record 17659876.
- Notebooks HIT 32³, 64³, 192³, 256³, 384³ e stress tests 512³; localizar 768³ e 912.
- Scripts `synthetic_HIT_decomposition.py`, `clustering.py`, validação Ethier–Steinman e qualquer código de projeção/variacional.
- Pesquisa de referências primárias independentes e auditoria de alegações de submissão/aceitação editorial.
