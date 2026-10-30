# MISSION_0014 — Auditoria da alegação de fechamento exato do tensor de Reynolds

**Data:** 2026-10-30  
**Tarefa:** 14.1 — PROGRESS  
**Fonte:** Zenodo 10.5281/zenodo.17763693, *Exact Closure of the Reynolds Stress Tensor via Weighted Subflow Averaging* (3 páginas).  
**Método:** leitura integral e verificação algébrica direta; sem execução de código.

## 1. Definições publicadas

O PDF declara:
[
v=\sum_{i=1}^{N}v_i,
\qquad
\langle v\rangle_M=\frac1N\sum_{i=1}^{N}v_i,
]
e
[
v'_M=v-\langle v\rangle_M
=\sum_{i=1}^{N}(v_i-\langle v\rangle_M).
]

Depois apresenta o tensor como:
[
v'_i v'_j=\frac1{N^2}\sum_{k=1}^{N}\sum_{l=1}^{N}
(v_{k,i}-\langle v_i\rangle_M)
(v_{l,j}-\langle v_j\rangle_M).
]

## 2. Verificação algébrica

Pela própria definição da média:
[
\sum_{i=1}^{N}(v_i-\langle v\rangle_M)
=\sum_i v_i-N\langle v\rangle_M
=v-v=0.
]
Portanto, a segunda igualdade usada para (v'_M) não é compatível com (v'_M=v-\langle v\rangle_M), exceto no caso degenerado em que a média é zero.

Além disso, o duplo somatório da expressão publicada fatoriza:
[
\frac1{N^2}
\left[\sum_k(v_{k,i}-\langle v_i\rangle_M)\right]
\left[\sum_l(v_{l,j}-\langle v_j\rangle_M)\right]
=0.
]
Logo, a expressão publicada é identicamente nula sob as próprias definições, para qualquer N. Não é a covariância usual dos subfluxos.

Uma covariância empírica entre subfluxos teria estrutura de soma simples de produtos centrados, por exemplo:
[
R_{ij}=\frac1N\sum_k
(v_{k,i}-\langle v_i\rangle_M)
(v_{k,j}-\langle v_j\rangle_M),
]
com média e ponderações definidas de forma consistente. Isso seria uma definição diferente e exigiria provar sua relação com o tensor de Reynolds físico da decomposição temporal/ensemble apropriada.

## 3. Consequências

- O PDF não demonstra fechamento exato do tensor de Reynolds.
- A alegação de que o tensor desaparece apenas quando (N\to1) não decorre da fórmula apresentada; a fórmula publicada colapsa a zero para qualquer N.
- A identidade (v=\sum_i v_i) e a definição de média aritmética dos próprios subfluxos precisam ser reconciliadas com a decomposição de Reynolds (v=\overline v+v').
- Mesmo uma covariância empírica correta entre subfluxos não elimina automaticamente o problema de fechamento dinâmico: seria necessário derivar a evolução de (R_{ij}), as correlações de ordem superior, as condições de média e a relação com os termos não lineares da NSE.
- A afirmação adicional de que cada subfluxo satisfaz individualmente Navier–Stokes em seu domínio depende de condições de interface e incompressibilidade que não estão demonstradas no PDF; ver a auditoria do DOI 17843237.

## 4. Classificação

**Erro algébrico interno na expressão de covariância tal como escrita.** Este é um achado verificável a partir das definições do próprio documento, não uma opinião de fórum. A alegação de “fechamento exato” não deve ser considerada demonstrada até que o autor publique uma definição corrigida e uma derivação consistente.

Fonte: https://zenodo.org/records/17763693
