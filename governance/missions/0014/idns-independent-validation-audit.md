# MISSION_0014 — Auditoria da alegada validação independente iDNS

**Data:** 2026-10-30  
**Tarefa:** 14.1 — PROGRESS  
**Fontes:** Zenodo 17771555, Zenodo 17730873/17730872, repositório GitHub RED-DAWN-AI/iDNS, arXiv 2510.09805v2.  
**Método:** leitura de PDF/README e inspeção estática dos solvers. Nenhum código foi executado.

## 1. O que o documento Multiflux 17771555 realmente demonstra

O PDF *Temporal Lifting in iDNS* (30 Nov 2025) é uma nota de Diógenes Sobral sobre o trabalho de Jeffrey Camlin. Não é um artigo de Camlin confirmando Multiflux. O próprio PDF faz a interpretação:
- amostragem adaptativa em regiões rígidas ≈ colapso de subfluxos (N(t)\to1);
- “resolution multiplier ×33” ≈ redução de aproximadamente 900 para 8–12 subfluxos.

O documento não apresenta:
- identificação/contagem de subfluxos no campo iDNS;
- algoritmo de decomposição aplicado aos dados de Camlin;
- medida independente de (N(t));
- dados que conectem os dois fatores;
- validação por Camlin de que iDNS foi desenvolvido ou testado como confirmação de Multiflux.

**Conclusão:** a alegação de validação independente é uma analogia interpretativa do autor da nota, não um resultado medido no trabalho iDNS. Um fator de amostragem temporal não é dimensionalmente equivalente a um número de subfluxos espaciais.

## 2. Repositório original iDNS localizado

- Repositório: https://github.com/RED-DAWN-AI/iDNS-Intelligent-Adaptive-Policy-for-Navier-Stokes
- Release/tag: `v2.0.0`, 15 Dec 2025.
- Branch principal HEAD observado: `ecd99f4dc34ad318f05f8595a8d6f52a03c4097d`.
- A versão v2.0 contém dois solvers públicos, utilitários, arquivos ZIP de dados e PDFs de diagnóstico.
- O README distingue `Spectral DNS` (R≥1) de `DNS-Coarse` (R<1), este último truncando modos sub-Kolmogorov por projeção de Galerkin.

## 3. Divergência entre a formulação temporal e os solvers

### 3.1 Solver 2D Kolmogorov

Arquivo: `1_solvers/idns_v10_kolmogorov_public.py`, tag v2.0.0.

O código:
- calcula `phi_prime = 1/sigma`;
- aplica `fac = 1/phi_prime` ao RHS da equação no tempo computacional;
- integra com passo `dt`;
- atualiza o tempo físico com `t += phi_prime * dt`.

Se `phi_prime=dτ/dt), então o passo físico deveria ser (Δt=Δτ/\phi'), não (\phi'Δτ). Se `phi_prime=dt/dτ), então o RHS em tempo computacional deveria ser multiplicado por `phi_prime`, não dividido por ele. A combinação implementada não corresponde à regra da cadeia para nenhuma das duas convenções usuais.

Sob a interpretação usada no README (RHS (N/\phi') e (Δt=\phi'Δτ)), a evolução física efetiva seria (du/dt=N/\phi'^2), não a NSE original.

### 3.2 Solver 3D Taylor–Green

Arquivo: `1_solvers/idns_v10_taylor_green_public.py`, tag v2.0.0.

O código:
- calcula `phi = sigmoid_phi(Dw,...)`;
- define `dt = dt_base * phi`;
- integra o RHS original com RK4 usando esse `dt`;
- atualiza `t += dt`;
- não mantém uma variável computacional `τ), não divide o RHS por `phi` e não usa a mesma transformação do solver 2D.

Esse código implementa passo temporal físico variável, não a mesma formulação de lifting descrita no README e no solver 2D. Os dois solvers não compartilham uma implementação consistente da transformação temporal.

## 4. Inconsistência de regra da cadeia no artigo temporal lifting

O arXiv 2510.09805v2 define:
[
U(x,\tau)=u(x,\varphi(\tau)),\qquad t=\varphi(\tau).
]
Logo, pela regra da cadeia:
[
\partial_\tau U=\varphi'(\tau)\partial_tu.
]
Partindo de (partial_tu+\mathcal N(u)=0), a equação transformada correspondente é:
[
\partial_\tau U+\varphi'(\tau)\mathcal N(U)=0.
]
Entretanto, o Teorema 3.1 publica:
[
\varphi'(\tau)\partial_\tau U+\mathcal N(U)=0.
]
A prova também declara (partial_t\psi=\varphi'\partial_\tau\tilde\psi), enquanto a definição (	ilde\psi(\tau)=\psi(\varphi(\tau))) implica (partial_\tau\tilde\psi=\varphi'\partial_t\psi), portanto (partial_t\psi=(1/\varphi')\partial_\tau\tilde\psi).

A transformação da medida (dt=\varphi' d\tau) e o peso (\varphi') na desigualdade de energia são compatíveis com a mudança de variável usual, mas a equação forte e o passo da prova fraca não são compatíveis com a definição de U/t publicada.

**Classificação:** inconsistência algébrica de fator recíproco no artigo v2, a ser esclarecida/corrigida pelo autor. A conclusão geral de que uma reparametrização temporal suave, monótona e com derivada limitada não elimina critérios de blow-up permanece correta para a transformação padrão; o texto atual, porém, não demonstra a equação que escreve.

## 5. O que os resultados iDNS podem e não podem sustentar

- Kolmogorov 2D em Re=10⁸ e grade 512² é um experimento 2D forçado; não é prova de regularidade global do sistema 3D.
- Taylor–Green 3D em Re=10⁵ com N=128³ tem razão de resolução (R=N/(1.6\sqrt{Re})≈0.25), classificada pelo próprio README como DNS-Coarse, não DNS.
- Taylor–Green 3D em Re=10⁸ com N=256³ tem (R≈0.016), também DNS-Coarse e fortemente sub-resolvido segundo o critério do próprio repositório.
- O README indica N≈512³ como limiar DNS para Re=10⁵. Assim, outputs de 128³ ou 256³ não podem ser chamados de DNS plenamente resolvido nesses regimes.
- O solver 3D possui filtro espectral de continuação para recuperação após divergência numérica. É necessário verificar os logs `continuations` antes de afirmar que a série publicada não recebeu filtragem.
- BKM finito em um sistema Fourier–Galerkin truncado e em tempo finito não prova regularidade global da NSE contínua.

## 6. Status da alegação de independência

O trabalho iDNS é uma contribuição numérica externa que merece ser analisada por seus próprios méritos. Contudo, a nota 17771555 não demonstra que os resultados iDNS validam a ontologia de subfluxos Multiflux. Para estabelecer essa ponte seriam necessários:
1. aplicar uma definição independente de subfluxo aos campos iDNS;
2. medir coerência, número e evolução temporal (N(t));
3. comparar com baselines e variar o método de decomposição;
4. demonstrar que o fator temporal de iDNS tem relação matemática com (N(t)), e não apenas semelhança narrativa;
5. corrigir/reconciliar a transformação temporal e os dois solvers.

## 7. Fontes

- https://zenodo.org/records/17771555
- https://zenodo.org/records/17730873
- https://github.com/RED-DAWN-AI/iDNS-Intelligent-Adaptive-Policy-for-Navier-Stokes
- https://github.com/RED-DAWN-AI/iDNS-Intelligent-Adaptive-Policy-for-Navier-Stokes/releases/tag/v2.0.0
- https://arxiv.org/html/2510.09805v2

Esta auditoria não executou os solvers nem reproduziu os CSVs. A tarefa 14.1 permanece PROGRESS.
