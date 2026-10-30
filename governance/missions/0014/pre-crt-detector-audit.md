# MISSION_0014 — Auditoria do Pre-CRT Stress Spike e do detector

**Data:** 2026-10-30  
**Tarefa:** 14.1 — PROGRESS  
**Fonte:** Zenodo 10.5281/zenodo.17752631, PDF *The Pre-CRT Stress Spike* (15 páginas).  
**Método:** leitura integral e inspeção estática do detector descrito no PDF; sem execução.

## 1. Alegações do documento

O PDF afirma que todo Change Regimental Transition (CRT) é precedido por um pico de uma variável de “resistência”, em sete domínios. Declara 100% de acertos históricos e apresenta uma regra:
[
R_{peak}\ge(3.8\pm1.1)R_{mean,12m}.
]
Também propõe prever o tempo até CRT usando o expoente 0,62.

## 2. Problemas de evidência

- A tabela mostra exemplos agregados, mas não disponibiliza os 31 eventos completos, séries temporais, fontes, timestamps, critérios de inclusão, critérios de CRT, nem casos negativos.
- “100% hits” não informa denominador verificável, falsos positivos, falsos negativos, seleção retrospectiva, janela de calibração ou validação fora da amostra.
- A regra descrita no texto não coincide integralmente com o detector: o PDF usa limiar 3,8 e tendência de 12% no código, mas não fornece documentação de unidades, normalização por domínio ou calibração.
- O cálculo `days = int(1 / abs(ddt)**0.62)` não inclui o prefator C da lei apresentada em outro registro, não demonstra consistência dimensional entre séries diárias e microsegundos, e não mostra ajuste/validação que produza previsões calibradas.
- A tabela mistura variáveis de naturezas e unidades distintas (vorticidade, taxa de colisão, VIX, prisões, frete, mortalidade) sem especificar uma transformação comum que permita comparar derivadas.
- O detector apresentado no PDF tem formatação textual com aspas tipográficas/numeração de linha; não há pacote executável, testes ou dados anexados no record lido.

## 3. Código externo citado

O PDF aponta para `https://github.com/MeshWave/PreCRT-Detector`. A consulta ao endpoint público GitHub para `MeshWave/PreCRT-Detector` retornou 404 e a busca GitHub por `PreCRT-Detector` não retornou repositório público. Isso não prova que o repositório nunca existiu ou não esteja privado/renomeado; significa que não foi localizado como fonte pública acessível nesta auditoria.

## 4. Relação com o 0.62 Law

O registro 17752954 afirma (R^2=0.991) e expoente (0.62\pm0.04) em 31 eventos e sete domínios, mas não contém dataset completo ou procedimento de ajuste. O PDF 17752631 apresenta somente uma tabela resumida de exemplos e uma regra heurística. Não é possível reproduzir o ajuste ou avaliar o poder preditivo sem as séries primárias e a definição dos eventos.

## 5. Classificação

**Hipótese de alerta precoce e lei de escala alegada, ainda não reproduzível.** O material disponível não sustenta “100% hits” nem uma previsão universal calibrada. A hipótese pode ser testada, mas requer dados completos, protocolo pré-registrado, separação treino/teste por evento/domínio, análise de falsos positivos e intervalos de previsão.

Fonte: https://zenodo.org/records/17752631
