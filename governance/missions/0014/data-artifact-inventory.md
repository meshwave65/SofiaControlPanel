# MISSION_0014 — Inventário de dados e artefatos binários do repositório

**Data:** 2026-10-30  
**Repositório:** `meshwave65/Multiflow-Turbulence`  
**Branch:** `main`  
**HEAD:** `e70572322f9c67ceb7daa9d47729b2b98d07f8f0`  
**Total de blobs:** 290

## 1. Contagem por extensão

| Extensão | Quantidade |
|---|---:|
| .ipynb | 52 |
| .md | 27 |
| .py | 19 |
| .pdf | 22 |
| .png | 95 |
| .jpg | 11 |
| .jpeg | 1 |
| .mp4 | 11 |
| .gif | 5 |
| .json | 8 |
| .txt | 19 |
| .html | 2 |
| .mlt | 1 |
| .xcf | 1 |
| .gitkeep | 10 |
| sem extensão | 5 |
| .gitignore | 1 |

## 2. Arquivos de dados científicos pesquisados

A árvore recursiva não contém arquivos com as extensões usuais de datasets numéricos:
- nenhum `.csv`;
- nenhum `.npz` ou `.npy`;
- nenhum `.h5` ou `.hdf5`;
- nenhum `.mat`, `.dat`, `.raw`, `.bin`;
- nenhum `.parquet` ou `.feather`;
- nenhum `.zip`, `.tar` ou `.gz`.

Os oito arquivos JSON encontrados são `meta.json`/checkpoints de 511 bytes, não datasets de campo. A presença de 95 PNGs, 11 JPGs, 1 JPEG, 11 MP4s e 5 GIFs indica artefatos visuais, mas não substitui os campos de velocidade, vorticidade, pressão, tabelas de cluster ou dados DNS necessários à reprodução.

## 3. Dados referidos em documentos, mas ausentes da árvore

- `src/analysis/clustervolumescomparison.csv` — citado pelo PDF Zenodo 17888128; não encontrado.
- `data/snapshot_Re550.npz` — requerido por `src/models/clustering.py`; não encontrado.
- `src/analysis/jhtdb/isotropic1024_fine_center_128c_t5.00.h5` — explicitamente ausente no notebook JHTDB.
- Pacote de CSV/NPZ/figuras que o relatório HIT 64 diz ter gerado — não identificado na árvore atual.
- Frames PNG e CSV descritos no record Zenodo 17803631 — o registro consultado lista apenas o PDF.
- Outputs brutos SciServer para 512³/768³ e evidências 912/324 — não localizados.

## 4. Notebooks e duplicação

Dos 52 notebooks:
- há numerosos checkpoints de 72 bytes, sem conteúdo experimental;
- existem cópias entre `output_multiflux/` e `src/decomposition/results/`;
- há arquivos com nomes de pasta que não correspondem ao N configurado no código;
- alguns notebooks contêm outputs salvos mas células-fonte vazias, ou código sem outputs;
- não se deve contar checkpoints/cópias como execuções independentes.

O manifesto `source-file-manifest.md` contém a lista completa de notebooks com tamanho e SHA do blob.

## 5. Conclusão de inventário

O repositório versiona bastante material visual e documental, mas **não contém os datasets numéricos primários necessários para reproduzir os principais resultados citados nos PDFs**. Para a tarefa 14.1, a ausência foi documentada; para a tarefa 14.3, será necessário obter os arquivos externos originais e associá-los a commits, hashes, parâmetros e notebooks correspondentes.
