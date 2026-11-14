# Blueprint da MISSION_0024 — Redesign Visual da MW-Ex / Banking Experience

**Missão:** MISSION_0024  
**Estado:** PROGRESS  
**Criação:** 2026-11-14  
**Orquestração:** SofiaControlPanel (SCP)  
**Produto-alvo:** MW-Ex — `meshwave65/newsite`, rota atual `/mw-ex`  
**Missão funcional de referência:** MISSION_0021  
**Relação:** missão estética complementar. Não substitui, reabre ou altera o escopo funcional da MISSION_0021.

## 1. Propósito

Elevar a experiência visual da MW-Ex ao padrão de um aplicativo financeiro/bancário profissional, preservando integralmente as funcionalidades, regras econômicas, contratos técnicos e fluxos que já estão implementados e em produção.

A avaliação do responsável é que a base funcional atual está satisfatória, mas a interface ainda apresenta aparência bruta, confusa e excessivamente próxima de formulários/painéis administrativos. Esta missão trata exclusivamente da apresentação e da experiência visual.

## 2. Resultado esperado

A MW-Ex deve transmitir a experiência de um produto financeiro consolidado:
- hierarquia visual clara, com carteira e patrimônio compreendidos rapidamente;
- navegação consistente e previsível entre as áreas já existentes;
- linguagem visual unificada para saldos, ativos, mercados, ordens, extratos e operações;
- componentes visuais refinados, com tipografia, espaçamento, cores, ícones, estados e feedback coerentes;
- composição responsiva e utilizável em desktop, tablet e celular;
- menor densidade visual e menor aparência de formulário, sem ocultar informação relevante ou reduzir controles de segurança.

## 3. Limites rígidos de escopo

### Incluído
1. Diagnóstico visual e de arquitetura de apresentação dos componentes MW-Ex existentes.
2. Definição de linguagem visual única e tokens de design.
3. Redesenho de layout, navegação, tipografia, cores, superfícies, cards, tabelas, listas, gráficos, formulários e estados.
4. Melhorias de composição, agrupamento, espaçamento, alinhamento, responsividade e acessibilidade visual.
5. Ajustes estritamente apresentacionais no JSX quando necessários para estruturar o layout, sem alterar lógica ou comportamento.
6. Testes de build, regressão visual e inspeção em desktop/mobile no Preview.

### Fora de escopo — proibido nesta missão
- Alterar regras de negócio, tokenomics, elegibilidade de ativos, negociação, ordens, conversões ou transferências.
- Alterar saldos, ledger, cálculos, precisão, estados financeiros ou qualquer fluxo de dinheiro/ativos.
- Alterar RPCs, APIs, consultas, endpoints, banco de dados, migrations, RLS, policies, grants ou credenciais.
- Criar funcionalidades, campos, filtros, indicadores ou ações novos.
- Remover ou ocultar informação operacional necessária, avisos, estados de indisponibilidade ou controles de segurança.
- Alterar autenticação, autorização, rotas canônicas ou integração Supabase.
- Migrar hospedagem, segregar repositórios, mudar domínio ou modificar configuração de deploy.
- Refatorar código não relacionado ao resultado visual.

## 4. Princípios de design

1. **App-first:** a experiência deve parecer uma aplicação financeira, não um website institucional nem um painel CRUD.
2. **Clareza antes de decoração:** prioridade para leitura de patrimônio, disponibilidade, estado e próxima ação.
3. **Confiança financeira:** números tabulares, alinhamento consistente, estados inequívocos, unidades explícitas e feedback discreto.
4. **Consistência:** um sistema de componentes e tokens, não uma coleção de estilos isolados acumulados.
5. **Densidade controlada:** agrupar conteúdo relacionado e usar espaço negativo; evitar excesso de bordas, caixas, gradientes e microtextos.
6. **Responsividade real:** navegação e componentes adaptados ao toque e à largura disponível.
7. **Integridade funcional:** toda ação existente deve continuar executando exatamente o mesmo fluxo.

## 5. Sequência de execução

- **24.1 — Diagnóstico visual:** inventariar telas, componentes, hierarquia, estilos duplicados/conflitantes e pontos de maior fricção. Registrar baseline funcional e visual.
- **24.2 — Direção de arte e sistema visual:** definir paleta, tipografia, escala, superfícies, navegação, componentes e estados; apresentar uma proposta coerente antes de espalhar alterações.
- **24.3 — Estrutura principal:** aprimorar shell, cabeçalho, navegação e visão de carteira/patrimônio.
- **24.4 — Áreas financeiras:** aplicar o sistema visual a mercado, compra/venda, conversões, transferências, atividade/extratos e áreas administrativas existentes, sem alterar seus comportamentos.
- **24.5 — Responsividade e QA:** verificar desktop/tablet/mobile, estados de loading/erro/vazio/sucesso, contraste, foco, overflow e regressões.
- **24.6 — Revisão e publicação:** abrir PR, revisar diff e evidências; merge e deploy somente conforme os gates de release já vigentes. A missão não autoriza alteração funcional ou financeira.

## 6. Critérios de aceite

1. A MW-Ex apresenta linguagem visual consistente de aplicação financeira premium.
2. A carteira/patrimônio tem hierarquia clara e leitura imediata.
3. Navegação e áreas existentes são reconhecíveis sem depender de formulários longos ou blocos visuais concorrentes.
4. Compra/venda, conversão, transferência, mercado e atividade mantêm todas as informações e controles existentes.
5. MWN permanece corretamente identificada como ativo operacional; referências indisponíveis ou não negociáveis continuam assim identificadas.
6. Estados de erro, pendência, indisponibilidade e confirmação permanecem claros e não são mascarados pela estética.
7. Desktop e mobile são utilizáveis, sem sobreposição, cortes, rolagem horizontal indevida ou controles pequenos demais.
8. Build passa e os fluxos existentes não apresentam regressões.
9. Diff limitado à apresentação; nenhuma alteração em banco, RPC, API, regra financeira ou configuração de deploy.
10. Preview visual é inspecionado e evidenciado; build READY isoladamente não equivale a QA visual.

## 7. Referências canônicas

- MISSION_0021: `governance/missions/0021/BLUEPRINT.md` e `MWEX_UI_PRODUCT_SPEC_21_4.md`.
- Estado funcional mais recente: `governance/missions/0021/PROGRESS.md`.
- Produto: `https://github.com/meshwave65/newsite`.
- Rota atual: `https://www.meshwave.com.br/mw-ex`.
- Produção atual permanece no deploy existente durante esta missão.

## 8. Gates e declarações

- Alterações de estilo/estrutura não autorizam alterações funcionais.
- Código em branch/PR não equivale a produção.
- Preview READY não equivale a inspeção visual autenticada.
- Nenhuma operação financeira real deve ser executada para QA.
- A missão só pode ser encerrada após inspeção visual documentada, build/testes, revisão do diff e confirmação de ausência de alterações fora do escopo.
