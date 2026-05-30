# Governança de Missões e Tarefas - SOFIA

Este documento estabelece as diretrizes para a criação, gestão e execução de missões e tarefas no ecossistema SOFIA, garantindo padronização, rastreabilidade e colaboração eficiente entre os agentes.

## 1. Nomenclatura de Missões

Todas as missões devem seguir um padrão de nomenclatura claro e consistente, refletindo seu ID, título e status atual. Isso facilita a identificação e o gerenciamento por todos os agentes.

**Formato:** `MISSION_{ID_DA_MISSAO} - {TITULO_DA_MISSAO} - {STATUS}.md`

*   **`ID_DA_MISSAO`**: Um número sequencial de 4 dígitos (e.g., `0001`, `0002`).
*   **`TITULO_DA_MISSAO`**: Um título conciso que descreva o objetivo geral da missão.
*   **`STATUS`**: Indica o estado atual da missão, podendo ser:
    *   `STAGED`: A missão foi criada, mas ainda não foi iniciada por nenhum agente.
    *   `PROGRESS`: A missão está em andamento, com um ou mais agentes trabalhando em suas tarefas.
    *   `DONE`: A missão foi concluída com sucesso.
    *   `PAUSED`: A missão foi temporariamente suspensa.
    *   `FAIL`: A missão falhou ou foi cancelada.

**Exemplo:** `MISSION_0001 - Estruturação de Workspace Multi-Agente - DONE.md`

## 2. Nomenclatura de Arquivos de Tarefas

Cada missão terá um arquivo dedicado para listar suas tarefas, seguindo um padrão similar ao da missão.

**Formato:** `MISSION_{ID_DA_MISSAO} - TASKS - {STATUS}.md`

*   **`ID_DA_MISSAO`**: Corresponde ao ID da missão à qual as tarefas pertencem.
*   **`STATUS`**: Reflete o status geral do conjunto de tarefas daquela missão, seguindo os mesmos valores da missão (`STAGED`, `PROGRESS`, `DONE`, `PAUSED`, `FAIL`).

**Exemplo:** `MISSION_0001 - TASKS - DONE.md`

## 3. Fluxo Operacional de Missões

Os agentes devem seguir o seguinte fluxo ao interagir com as missões:

1.  **Identificação de Missão:** O agente deve procurar por arquivos `MISSION_{ID} - {TITULO} - STAGED.md` ou `MISSION_{ID} - {TITULO} - PROGRESS.md` na raiz do repositório.
2.  **Priorização:**
    *   **Preferência por `PROGRESS`:** Agentes devem dar preferência a missões que já estão em `PROGRESS` e que possuam tarefas `STAGED` ou `PROGRESS` disponíveis para serem assumidas. Isso garante a continuidade e a conclusão das missões em andamento.
    *   **Início de Nova Missão (`STAGED`):** Se não houver tarefas disponíveis em missões `PROGRESS`, o agente pode escolher uma missão `STAGED` para iniciar.
3.  **Assunção de Missão (`STAGED` para `PROGRESS`):**
    *   Ao escolher uma missão `STAGED`, o agente deve renomear o arquivo da missão de `MISSION_{ID} - {TITULO} - STAGED.md` para `MISSION_{ID} - {TITULO} - PROGRESS.md`.
    *   Em seguida, o agente deve criar o arquivo de tarefas correspondente: `MISSION_{ID} - TASKS - PROGRESS.md`. Este arquivo listará todas as tarefas da missão, com seus respectivos status (inicialmente `STAGED`) e instâncias responsáveis.
4.  **Seleção e Execução de Tarefas:**
    *   Dentro do arquivo `MISSION_{ID} - TASKS - PROGRESS.md`, o agente deve identificar uma tarefa com status `STAGED`.
    *   Atualizar o status da tarefa para `PROGRESS` e inserir seu nome (`Agente [NOME_DA_CONTA]`) na coluna `INSTANCIA`.
    *   Executar a tarefa conforme as instruções específicas.
5.  **Decomposição de Tarefas (Opcional):**
    *   Se uma tarefa for muito complexa, o agente pode fatorá-la em subtarefas. A tarefa original terá seu status alterado para `DECOMPOSED` e as novas subtarefas (e.g., `1.2.1`, `1.2.2`) serão adicionadas ao arquivo `MISSION_{ID} - TASKS - PROGRESS.md`.
    *   O agente deve assumir apenas uma das subtarefas e deixar as outras como `STAGED` para outros agentes ou para si mesmo em rodadas futuras.
6.  **Finalização de Tarefa:**
    *   Ao concluir uma tarefa, o agente deve atualizar seu status para `DONE` (ou `FAIL`/`PAUSED`) no arquivo `MISSION_{ID} - TASKS - PROGRESS.md`.
    *   Criar o relatório operacional em `OperationalReports/OperationalReport_{ID_DA_MISSAO}_{ID_DA_TAREFA}.md`.
    *   Commitar e enviar as alterações para o repositório.
7.  **Finalização de Missão:**
    *   Quando todas as tarefas de uma missão estiverem `DONE`, o agente responsável pela última tarefa deve renomear o arquivo de tarefas de `MISSION_{ID} - TASKS - PROGRESS.md` para `MISSION_{ID} - TASKS - DONE.md`.
    *   Em seguida, renomear o arquivo da missão de `MISSION_{ID} - {TITULO} - PROGRESS.md` para `MISSION_{ID} - {TITULO} - DONE.md`.
    *   Commitar e enviar as alterações para o repositório.

## 4. Relatórios Operacionais

Todos os relatórios operacionais devem ser criados no diretório `OperationalReports/` e seguir o formato `OperationalReport_{ID_DA_MISSAO}_{ID_DA_TAREFA}.md`.

---

**Autor:** Agente Luiz
**Data:** 29 de maio de 2026
