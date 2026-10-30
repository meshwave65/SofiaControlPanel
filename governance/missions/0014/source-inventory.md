# MISSION_0014 — Inventário inicial de fontes (checkpoint)

**Estado:** EM EXECUÇÃO — inventário parcial, não conclusivo  
**Data da coleta:** 2026-10-30  
**Tarefa:** 14.1 — Reconciliar identidade do projeto e inventariar fontes primárias  
**Instância:** Agente ChatGPT  
**SCP:** `main` — assunção da missão/tarefa publicada nos commits `2f190dc72cce79e6db8dc5149f6c348ce981e3c4`, `7bbcc21eebfbde4a9557258208271ccd961e2af9`, `79ee7dee95d6b880f10442e51deff1e73d23ce7b`, `2dd37543c6f11f504af217cefc57c09b1e2fb0c2`.

> Este documento é um checkpoint de inventário. Não representa leitura integral do corpus nem conclusão da tarefa 14.1.

## 1. Identidade e proveniência — estado inicial

- Nome informado pelo responsável: **Multiflux Theory / MultifluxTheory**.
- Repositório candidato confirmado como existente: [meshwave65/Multiflow-Turbulence](https://github.com/meshwave65/Multiflow-Turbulence).
- Branch inspecionada: `main`.
- HEAD observado durante a coleta: `e70572322f9c67ceb7daa9d47729b2b98d07f8f0`.
- README declara que o repositório é o hub de desenvolvimento da tese “Turbulence as Multiflux: A Unified Framework”, de Diogenes Duarte Sobral.
- A identidade entre o nome “Multiflux Theory” e o repositório “Multiflow-Turbulence” é **fortemente sugerida pela documentação do próprio repositório**, mas ainda será cruzada com os DOIs, versões e demais fontes antes de ser declarada canônica.
- Não foram feitas renomeações nem alterações no repositório científico.

## 2. Inventário estrutural do repositório candidato

Árvore GitHub recursiva consultada em `main`; 290 blobs contabilizados:

| Tipo | Quantidade |
|---|---:|
| Arquivos totais (blobs) | 290 |
| Notebooks Jupyter (`.ipynb`) | 52 |
| PDFs | 22 |
| Scripts Python | 19 |
| Markdown | 27 |
| Imagens/figuras | 113 |
| Vídeos | 11 |

Principais grupos de fontes:

- `thesis/`: formulações e versões de Paper 1–3, tese completa V2, “Multiflux Fluid Dinamic V 5_0.md”, versões PDF do paper unificado e resposta editorial.
- `docs/`: reavaliação da fundamentação teórica (19/11/2025), artigos sobre decomposição instantânea, relatórios suplementares, plano de validação OpenFOAM/POD-DMD, status de desafios de validação e relatórios de aplicações.
- `src/decomposition/`: implementação de decomposição HIT, requisitos e notebooks de validação Ethier–Steinman.
- `src/models/`: clustering, inspeção de dados e tentativa de validação JHTDB.
- `src/simulators/`: scripts de simulação, benchmark Ethier–Steinman, analogias de gota/perturbação e HTML de simulador.
- `output_multiflux/`: notebooks, resultados, metadados, relatórios, gráficos, outputs 2D/3D, estudos Voronoi-Bayes e stress tests SciServer.

A contagem inclui checkpoints Jupyter e mídias; não equivale a 290 fontes científicas independentes. Duplicatas, checkpoints, resultados derivados e artefatos vazios serão distinguidos na catalogação detalhada.

## 3. Escalas e artefatos observados na árvore

Notebooks identificados nominalmente incluem ensaios/diretórios associados a 32, 64, 128, 192, 194, 256 e 384. Há imagens de resultado em 512 no diretório `output_multiflux/sciserver_stress_tests/results/512/`.

- 768³ aparece em metadados/descrições de registros Zenodo como alegação de convergência, mas ainda não foi localizado notebook ou dataset 768 na árvore examinada.
- 912 e 324 não foram localizados nominalmente na árvore do repositório consultado.
- Isso não prova inexistência: podem estar em outro branch, repositório, armazenamento externo, SciServer ou anexo de publicação. A localização precisa continua pendente.
- Não inferir que os valores sejam dimensões cúbicas em todos os contextos até ler cada notebook e seus metadados.

## 4. Observações técnicas preliminares diretamente verificadas

### 4.1 README e Release Notes

O README descreve a decomposição do campo de velocidade como soma finita de subfluxos locais, `v(x,t) = Σᵢ vᵢ(x,t)`, e caracteriza cada componente como subfluxo laminar local. A documentação afirma que a turbulência emerge da interação não linear entre subfluxos.

As Release Notes `v1.0-cpu384` (dezembro de 2025) declaram:
- HIT sintética em 64³, 128³, 192³, 256³ e 384³;
- síntese espectral, espectro Kolmogorov `k^-5/3` e projeção solenoidal;
- invariantes `|ω|`, Q, `λ₂` e gradiente de velocidade;
- K-means com `k=12`;
- `N_eff=12` reportado em todas as resoluções;
- corte de 0,5% e análise multi-threshold 0,1–2,0%.

Esses são registros de alegações/metodologia do projeto; não equivalem a reprodução independente.

### 4.2 Notebook Multiflux v2.0 Euleriano–Lagrangiano

No notebook `output_multiflux/output_multiflux_2_0_Euler-Lagrange/MFT2_0_Euleriano_Lagrange.ipynb` foi observado:
- `K_CLUSTERS = 12`;
- `VOLUME_CUTOFF = 0.005`;
- `N_eff = np.sum(counts > VOLUME_CUTOFF * labels_flat.size)`;
- o notebook configura `N=128` no código inspecionado;
- outputs salvos no próprio notebook mostram `N_eff=12`.

Consequência metodológica a investigar: como o algoritmo fixa 12 clusters, a métrica calculada por contagem de clusters acima do limiar satisfaz necessariamente `N_eff ≤ 12`. Obter 12 significa que os 12 clusters impostos superaram o corte; isso, isoladamente, não demonstra que 12 seja um número emergente e independente da escolha de `k=12`. É uma questão de independência do parâmetro a ser testada, não uma refutação da hipótese física.

### 4.3 Versões e escopo

A tese `Multiflux Fluid Dinamic V 5_0.md` (novembro de 2025) contém a decomposição local, hipótese de supressão por alta velocidade/“Second Laminar Regime” e hipótese de arrasto molecular granular, além de resultados alegados de redução de arrasto. A Release Notes e o notebook v2.0 mostram um foco posterior em HIT sintética, clustering de invariantes e formulação variacional. A continuidade, alteração ou separação formal entre essas versões ainda precisa ser reconstruída.

## 5. Zenodo — comunidade Multiflux

- Endpoint oficial da comunidade identificado: `https://zenodo.org/api/communities/multiflux`.
- Identificador interno da comunidade: `dbbd39ef-1985-409e-bf9f-878fd936c774`.
- Título da comunidade: “Multiflux Theory”.
- Descrição oficial declara foco em dinâmica dos fluidos, interação determinística de subfluxos laminares locais e aplicações.
- A API de registros da comunidade informa **33 registros no total**, 32 datados de 2025 e 1 de 2026; tipos agregados: 25 publicações e 8 apresentações; todos com acesso aberto. A paginação foi testada em lotes pequenos e a terceira página com tamanho 25 retornou `hits=[]`, `total=33`.
- O inventário registro-a-registro permanece em curso. Não declarar leitura integral dos 33 registros nesta etapa.

Identificadores/DOIs já encontrados no material de comunidade ou nas fontes primárias vinculadas (lista parcial, a reconciliar com os 33 registros):
- `10.5281/zenodo.18174808` — “Mathematical Foundations of Multiflux Theory”, record 18174808; metadados indicam preprint, licença CC BY-NC-SA 4.0, arquivo PDF e relação de versão com parent record 17843236. A descrição diz submissão revisada à Physical Review Fluids, Manuscript ID FM10236, janeiro de 2026; isso é metadado/declaração do depósito, não confirmação editorial independente.
- `10.5281/zenodo.17843236` — parent/concept record referido pelo registro 18174808.
- `10.5281/zenodo.18037445` — descrição de preprint sobre Restoration Collapse Term em Navier–Stokes 2D e vórtice de Taylor–Green.
- `10.5281/zenodo.17689067` — “Multiflux Theory v1.0 – Complete Official Collection”, 23/11/2025; inclui claims sobre regularidade Navier–Stokes, Subflow Herding, redução de arrasto, aplicações industriais/ESG, supressão de alta velocidade e QRT.
- `10.5281/zenodo.17715165` — trabalho sobre eliminação de escudos térmicos de reentrada via arrasto granular/QRT; contém claims quantitativos de Mach 12–15, colapso N(t) e qDSMC que exigem auditoria própria.
- `10.5281/zenodo.17640542` — descrição de argumento/roteiro de regularidade global de Navier–Stokes com Energy Ceiling Lemma e Laminar Collapse Conjecture.
- `10.5281/zenodo.17677090` — “A Vetorização do Estado de Subfluxo”, metodologia VSE/DES e controle ativo de fluxo.
- `10.5281/zenodo.17655495` — pacote de versão pública revisada de “Turbulence as Multiflux”, com hipóteses de alta velocidade e arrasto molecular granular e discussão das limitações de KMeans/GMM.
- `10.5281/zenodo.17582481` / `10.5281/zenodo.17561627` — registros relacionados ao título “Turbulence as Multiflux: A New Conceptual Perspective”; relação exata de versão/parent pendente.
- `10.5281/zenodo.17887596` — registro ligado à discussão HIT ResearchGate, descrito como evidência numérica sintética 64³–384³.
- `10.5281/zenodo.17933779` — versão 2.0 variacional, citada na discussão ResearchGate.

A coleta inicial da listagem identificou total de 33 registros, mas a extração automática de texto não expôs de modo confiável todos os metadados de cada hit. Próxima etapa: percorrer páginas em lotes menores, registrar os 33 títulos/DOIs/versões e consultar individualmente cada record, seus arquivos e relações de versão.

## 6. ResearchGate e CFD-Online — estado de acesso

- ResearchGate HIT: tentativa de leitura direta via fetch retornou bloqueio anti-bot; contexto anterior contém leitura preliminar da discussão e referência ao DOI 17887596, ainda não substitui a leitura integral nesta execução.
- ResearchGate publication 399025958: tentativa de leitura direta retornou HTTP 403. O repositório contém PDF com título correspondente `docs/Numerical_Evidence_for_Instantaneous_Multiflux_Decomposition_in_Synthetic_Turbulence_Fields.pdf`; correspondência de versão/DOI precisa ser confirmada.
- CFD-Online: fetch das três páginas retornou bloqueio anti-bot nesta execução. Contexto anterior contém observações preliminares das três páginas; o corpus integral e a matriz de objeções permanecem pendentes.

## 7. Lacunas e próximos passos

1. Enumerar individualmente os 33 registros Zenodo, todas as versões e arquivos; identificar duplicatas, registros parent/concept e materiais sem relação direta com turbulência.
2. Ler os PDFs completos depositados no Zenodo e os arquivos correspondentes no GitHub, comparando versão e checksum quando possível.
3. Reconciliar os dois itens ResearchGate com DOIs, versões e PDFs do repositório.
4. Retomar CFD-Online por URLs de página, cache público, espelhos ou referências citadas; registrar tentativa/erro por item.
5. Inventariar branches e commits do repositório candidato e procurar outros repositórios associados ao autor/projeto.
6. Localizar notebooks/datasets 768, 912 e 324 ou registrar bloqueio específico e fonte de armazenamento.
7. Auditar o simulador Replit sem presumir equivalência com os notebooks.

## 8. Limites desta coleta

- Nenhum notebook foi executado; nenhum resultado foi reproduzido.
- Nenhum PDF foi integralmente revisado nesta etapa.
- Nenhum dado ou código do repositório científico foi alterado.
- O corpus Zenodo foi parcialmente enumerado; a listagem total (33) está verificada, mas a catalogação individual não está completa.
- A identidade canônica do projeto e a relação entre Multiflux Theory / Multiflow-Turbulence permanecem em reconciliação.
