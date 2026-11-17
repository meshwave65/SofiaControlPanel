# Solicitação original — MISSION_0027

O usuário apresentou o projeto `ncklrs/claude-chrome-user-testing`, descrito como uma skill/plugin que simula diferentes perfis de usuários, com tempos de reação, padrões comportamentais e gatilhos de frustração. A versão ampliada oferece mais de 25 personas, testes em viewport móvel, auditoria WCAG, testes de formulários e comparação A/B.

Limitação identificada na solicitação: a automação do navegador depende de `claude --chrome`, portanto a solução foi desenhada para Claude Code em computador.

Solicitação:
1. Criar uma missão no SCP para avaliar os sistemas MeshWave/SOFIA.
2. Verificar se a capacidade pode ser implementada no ecossistema atual.
3. Caso a implementação direta não seja viável, identificar uma alternativa capaz de executar os testes.
4. Avaliar e construir uma skill própria, executável pelos agentes através do SCP, sem dependência do Claude Code.

Referência original: https://github.com/ncklrs/claude-chrome-user-testing

## Interpretação operacional

O objetivo não é reproduzir a dependência de Claude/Chrome. É preservar a metodologia útil — personas, roteiros, temporização, observação, acessibilidade e evidências — e substituir o adaptador de automação por uma capacidade compatível com o runtime da SOFIA.

A simulação de personas deve ser identificada como teste automatizado/sintético. Não pode ser apresentada como pesquisa empírica com pessoas reais nem como substituto integral de testes moderados com usuários humanos.
