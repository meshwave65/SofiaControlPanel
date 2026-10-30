# MISSION_0014 — Inventário complementar de registros Zenodo

**Data:** 2026-10-30  
**Tarefa:** 14.1 — PROGRESS  
**Método:** leitura de PDFs e metadados públicos; sem execução de código.

## 1. Temporal Lifting in iDNS — Zenodo 17771555

A página do registro foi lida, mas o PDF `Note_JCamlin.pdf` retornou `target_unreachable`. A descrição atribui ao iDNS resultados de integração espectral, aceleração computacional e adaptação temporal, e interpreta esses resultados como confirmação independente de subfluxos finitos.

O trabalho externo de Camlin *iDNS: Numerical Validation of Global Smooth Weak Solutions for 3D Navier–Stokes on T³* foi localizado no PhilArchive, listado como “arXiv (forthcoming)”. A página e o arquivo foram bloqueados por anti-bot. O artigo distinto de temporal lifting, arXiv:2510.09805v2, não menciona Multiflux nem valida subfluxos.

**Status:** a independência e a equivalência interpretativa alegadas no registro 17771555 não foram verificadas. A descrição Zenodo é uma interpretação do projeto Multiflux; não substitui uma declaração do autor externo nem uma comparação matemática.

## 2. Physical Origin of Turbulence and Wingtip Vortices — Zenodo 17761503

O PDF propõe “Vacuum Shepherding Failure” como mecanismo causal para turbulência e vórtices de ponta de asa. O documento não apresenta derivação quantitativa a partir das equações de conservação, critério dimensional, conjunto de dados ou protocolo experimental reproduzível. O próprio arquivo informa DOI a gerar.

**Status:** hipótese física proposta; não demonstração do mecanismo.

## 3. Extensões QRT e qDSMC — Zenodo 17715165, 17711548 e 17711252

Foram lidos os três PDFs. Eles apresentam hipóteses de transição regimental/coerência e resultados declarados de simulações qDSMC em choque hipersônico. O registro 17711252 descreve um protocolo preliminar e lista extensões 3D e cálculo de parâmetro de ordem como trabalho futuro; o registro 17711548 descreve um estudo posterior com configuração ampliada.

Lacunas comuns no material lido:
- código-fonte e versão do solver não fornecidos no documento;
- ausência de detalhes suficientes para reproduzir colisões, condições de contorno e implementação numérica;
- ausência de estudo de convergência e incerteza completo;
- vínculo entre métrica de clusters e interpretação física não especificado de forma suficiente;
- claims de coerência macroscópica exigem validação física independente.

O registro 17715165 estende as hipóteses para aplicações de reentrada. O PDF contém claims de desempenho, mas não fornece no material lido pacote de simulação, dados e validação independente que permitam verificar esses números.

**Status:** extensões e alegações separadas do núcleo HIT/subfluxos; não devem ser usadas como validação deste núcleo sem uma ponte matemática e experimental explícita.

## 4. Fontes e bloqueios

- https://zenodo.org/records/17771555 — página lida; PDF não acessível nesta tentativa.
- https://zenodo.org/records/17761503 — PDF lido; DOI não visível no arquivo.
- https://zenodo.org/records/17715165 — PDF lido.
- https://zenodo.org/records/17711548 — PDF lido.
- https://zenodo.org/records/17711252 — PDF lido.
- https://philarchive.org/rec/CAMIIA-3 — página iDNS bloqueada por anti-bot.
- https://philarchive.org/archive/CAMIIA-3v3 — arquivo bloqueado por anti-bot.
- https://arxiv.org/abs/2510.09805 — artigo temporal lifting consultado; é distinto do artigo iDNS citado.

A comunidade Zenodo ainda não está integralmente lida. A tarefa 14.1 permanece PROGRESS.
