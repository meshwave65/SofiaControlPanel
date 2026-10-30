# MISSION_0014 — Auditoria do preprint expandido e da discussão CFD-Online

**Data:** 2026-10-30  
**Tarefa:** 14.1 — PROGRESS  
**Fonte adicional relacionada:** DOI 10.5281/zenodo.17843237 (referido na discussão CFD-Online; membership na comunidade de 33 registros ainda precisa ser reconciliado).  
**Método:** leitura integral do PDF de 8 páginas e consulta às três páginas da discussão pública. Sem execução de código.

## 1. Registro adicional 17843237

Título: *Mathematical Foundations of Multiflux Theory — Expanded Edition*  
Data: 6 Dec 2025; versão v1; PDF `OJFD_Review_final_Dez2025 (1).pdf`; 321.9 kB; licença CC BY-NC-SA 4.0.

A descrição do Zenodo anuncia projeção ortogonal exata, termo inter-subfluxo, balanço energético, closure Mori–Zwanzig, equação reduzida de N(t), PRE-CRT e lei CRT com expoente 0.62. O PDF foi lido integralmente.

## 2. Partição e incompressibilidade

O documento define uma feature vector `φ(x,t)` e uma partição de Voronoi induzida por clustering:
[
C_k(t)=\{x:\operatorname{argmin}_j\|\phi(x,t)-\mu_j(t)\|=k\},\qquad
v_k=\chi_k v.
]

Para uma partição por indicadores disjuntos com `Σχ_k=1`, a soma `Σv_k=v` é válida. Entretanto:
[
\nabla\cdot v_k=\nabla\cdot(\chi_k v)=v\cdot\nabla\chi_k+\chi_k\nabla\cdot v
=v\cdot\nabla\chi_k.
]
Mesmo que `v` seja incompressível, cada `v_k` não é, em geral, solenoidal nas interfaces. Como `χ_k` é indicador de região, `∇χ_k` é uma distribuição concentrada na interface. Portanto, o documento não pode tratar automaticamente cada `v_k` como campo de velocidade incompressível regular sem condições de interface, regularização ou projeção de Helmholtz adicional.

A multiplicação por `χ_k` é uma projeção ortogonal em (L^2) para uma partição disjunta, mas não preserva, em geral, o subespaço de campos divergência-zero. O texto chama o procedimento de “exact orthogonal projection” sem especificar o espaço funcional no qual a ortogonalidade é afirmada.

## 3. Auditoria da equação projetada e do termo (f_k)

O PDF usa:
[
\partial_t v_k+(v_k\cdot\nabla)v_k=-\nabla p_k+\nu\Delta v_k+f_k+f_{ext,k}
]
com (v_k=\chi_kv), e propõe:
[
f_k=-\sum_{j\ne k}\chi_k(v_j\cdot\nabla)v
+(\partial_t\chi_k)v
+\nu\left(2\nabla\chi_k\cdot\nabla v+(\nabla^2\chi_k)v\right).
]

**Verificação algébrica necessária:** aplicando diretamente a regra do produto a (v_k=\chi_kv):
[
\partial_t v_k=\chi_k\partial_t v+(\partial_t\chi_k)v,
]
[
(v_k\cdot\nabla)v_k
=\chi_k(v\cdot\nabla\chi_k)v+\chi_k(v\cdot\nabla)v
quad(\chi_k^2=\chi_k),
]
[
\Delta v_k=\chi_k\Delta v+2(\nabla\chi_k\cdot\nabla)v+(\Delta\chi_k)v.
]
Multiplicando a NSE original por (\chi_k) e substituindo essas identidades, aparecem termos de interface e o termo convectivo (\chi_k(v\cdot\nabla\chi_k)v). Além disso:
[
-\chi_k\nabla p=-\nabla(\chi_kp)+p\nabla\chi_k.
]

Esses termos não aparecem explicitamente na expressão publicada de (f_k), que contém em seu lugar (-\sum_{j\ne k}\chi_k(v_j\cdot\nabla)v). Para indicadores disjuntos, (chi_k\chi_j=0) para (j\ne k), de modo que essa soma não reproduz automaticamente os termos acima. O PDF não demonstra uma identidade que reconcilie as expressões.

**Classificação:** derivação publicada não está demonstrada e apresenta discrepância algébrica aparente. Isso não é uma refutação definitiva: o autor pode ter outra definição para (chi_k), (p_k), (v_j) ou uma convenção de interface não explicitada. É necessário exigir a derivação linha a linha, incluindo pressão e distribuições de interface.

## 4. Regularidade das interfaces

Para uma partição hard, (chi_k) é descontínua. Logo, (
ablachi_k) e (Deltachi_k) são distribuições de superfície e derivadas de distribuições, não funções clássicas regulares. O PDF usa esses termos como forças locais e afirma que o movimento da partição é bem definido, mas não fornece:
- regularização de (chi_k) ou classe funcional para interfaces;
- condições de salto para velocidade, pressão e tensões;
- tratamento de (Deltachi_k) e produtos com campos na interface;
- prova de que (f_k) pertence ao espaço necessário para a equação projetada;
- fechamento que mantenha a conservação de momento/energia ao longo de mudanças topológicas.

A fórmula de velocidade de interface (u_b=-(\partial_t\phi/|\nabla\phi|)n) também requer uma função nível escalar e gradiente não nulo; o documento define (phi) como vetor de atributos, sem derivar a redução a uma função nível escalar.

## 5. Balanço energético

O PDF define (E_k=\frac12\int_{C_k}|v|^2,dV) e propõe termos (T_{kk},T_{kj},D_k,W_k,B_k). Porém, (D_k=-\nu\int|\nabla v_k|^2) envolve gradientes de (chi_kv), que contêm distribuições de interface no caso de indicadores hard. O texto não apresenta regularização/condições de salto que tornem o termo finito, nem demonstra cancelamento exato dos termos inter-subfluxo na soma global. O balanço é apresentado como resultado, mas a derivação completa não está exposta.

## 6. Evolução de (N(t))

O modelo proposto é:
[
\frac{dN}{dt}=\alpha\|\nabla v\|-\beta\nu k^2N-\gamma N^2.
]
A forma é fenomenológica; o documento não fornece derivação a partir da NSE, definição operacional de (k), valores/unidades/calibração de (alpha,\beta,\gamma), dataset de ajuste ou validação fora da amostra. (N(t)) é contado como número de regiões inteiras, mas evolui por ODE contínua sem regra de nascimento/fusão/fragmentação que conecte o modelo contínuo à variável inteira observada.

A afirmação de plateau universal (N_{eq}\approx8–12) não decorre matematicamente da equação sem restrições e calibração dos parâmetros.

## 7. PRE-CRT e lei universal CRT

O documento define uma entropia de partição (S=-\sum_k(|C_k|/|\Omega|)\ln(|C_k|/|\Omega|)) e declara 31 colapsos com:
[
\tau_{CRT}=C\left(\frac{dS}{dt}\right)^{-0.62\pm0.04}.
]
O PDF não apresenta a tabela dos 31 eventos, definição de evento/tempo CRT, fontes de dados, regressão, resíduos, intervalo de confiança ou validação independente. Também afirma (dS/dt\propto dN/dt) sem demonstração. A derivada da entropia depende da distribuição de volumes e pode variar com (N) constante; a proporcionalidade não é identidade geral.

**Classificação:** lei empírica alegada sem dataset/fitting package no documento lido; não validada.

## 8. Discussão CFD-Online: objeções e evolução das respostas

Fonte: https://www.cfd-online.com/Forums/site-help-feedback-discussions/261616-contested-ai-based-theory-new-framework-turbulence-multiflux-theory.html

### Objeções técnicas centrais

- **Denaro (8 Dec 2025):** pergunta por que não usar forma fraca/projeção por funções-teste; alerta que discretizar forma quasi-linear pode perder conservação discreta de momento e pergunta como as velocidades dos subespaços garantem conservação global.
- **Denaro e outros:** questionam significado físico de (N≈8–12), a diferença em relação a grandes estruturas/energy-containing eddies, e completude das equações.
- **LuckyTran:** aponta possível sobreposição conceitual com teorema de transporte, cascata/backscatter, modelos de N equações, decomposição de estruturas coerentes e modelos multifásicos; destaca que a interação (f_i) é o único possível núcleo de novidade e precisa ser explicitada.
- **Outros participantes:** pedem equações, definição de (f_i), critérios de seleção de N, conservação, demonstração de previsões novas e validação por DNS/solver.

### Respostas e admissões do autor registradas no próprio thread

- **3 Dec 2025:** o autor declara que os testes são principalmente post-processing a posteriori de snapshots DNS/JHTDB e channel-flow; a interação explícita de massa/momento (comparada a BGK) ainda não está codificada; não havia simulação forward-in-time completa partindo de t=0; validação a priori LES/DNS permanecia em andamento.
- **4 Dec 2025:** o autor reconhece que uma prova matemática rigorosa ainda está ausente.
- **8 Dec 2025:** promete fornecer projeção exata, derivação de (f_i), hipóteses de fechamento e validação. A resposta à conservação diz que as equações podem ser reescritas em forma divergente para volume finito, mas não apresenta naquele post uma derivação completa.
- **10–11 Dec 2025:** o autor passa a chamar o estudo de “definitive numerical evidence”, com N_eff=12 em 32³–384³ e clustering KMeans. A metodologia continua sintética e com (k=12) imposto; isso não equivale a seleção emergente e independente do número de subfluxos.
- **12 Dec 2025:** Denaro solicita testar (N(t)) em diferentes tempos e diferentes valores de (d), sinalizando que dinâmica temporal e sensibilidade ainda precisavam ser investigadas.
- **15–18 Dec 2025:** o autor apresenta a versão variacional e outputs de ação/dissipação; as objeções sobre significado físico, número 12 e relação com métodos conhecidos continuam.

### Consequência para a auditoria

O thread é fonte primária importante porque registra o estado do desenvolvimento em tempo real. A admissão de ausência de solver forward-in-time e de prova matemática em 3–4 Dec deve ser confrontada com claims posteriores de “definitive evidence” e “rigorous regularization”. A evolução pode refletir avanços posteriores, mas os novos documentos precisam efetivamente fechar os gaps apontados; a cronologia por si só não os resolve.

## 9. Relação com o ResearchGate HIT

A discussão ResearchGate de 11 Dec 2025 declara explicitamente:
- campos HIT inteiramente sintéticos;
- espectro Kolmogorov −5/3;
- projeção solenoidal;
- invariantes (|\omega|,Q,\lambda_2);
- KMeans com (k=12);
- sem DNS externo;
- (N_eff=12) para clusters acima de 0,5%.

Portanto, essa discussão é evidência de um experimento de clustering em campos sintéticos, não validação em DNS independente. A publicação ResearchGate 399025958 não foi acessível diretamente nesta rodada; o PDF Zenodo 17888128, de título correspondente, foi lido e contém marcadores editoriais não resolvidos e validação DNS real como etapa futura.

## 10. Fonte adicional e limitações

- DOI 10.5281/zenodo.17843237: https://zenodo.org/records/17843237
- CFD-Online, páginas 1–3: link acima; páginas 1 e 2 foram abertas, a página 3 foi recuperada parcialmente via indexação de busca.
- ResearchGate HIT: https://www.researchgate.net/post/Multiflux_Theory_First_Reproducible_HIT_Simulations_64384_and_Stable_N_eff_12_Across_Resolutions
- ResearchGate publication 399025958: acesso direto bloqueado; o PDF Zenodo de título correspondente foi usado como fonte documental paralela.

A tarefa 14.1 permanece PROGRESS. O DOI 17843237 foi descoberto por referência no CFD-Online e ainda precisa ser reconciliado com o total/lista dos 33 registros Zenodo originalmente catalogados.
