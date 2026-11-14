# Complemento funcional — Consultas temporais e gráficos do preço MWN

**Missão:** MISSION_0021  
**Estado:** DEFINIÇÃO FUNCIONAL PROPOSTA PARA APROVAÇÃO  
**Data:** 2026-11-12  
**Referência:** OR-20261112-0057

## 1. Princípio

A MW-Ex opera continuamente, 24 horas por dia, sem sessões de abertura e fechamento de pregão. A evolução histórica do preço interno da MWN deve ser consultada a partir dos eventos efetivos de alteração ocorridos no intervalo solicitado.

O gráfico não deve depender de uma tabela pré-populada com uma linha por hora ou por dia. Deve consultar a série histórica de eventos e montar a representação correspondente ao filtro escolhido.

## 2. Referência de fechamento diário

Para consultas diárias, o preço de fechamento de cada dia será o preço vigente às 23:59:59, no fuso horário oficial que vier a ser definido para a MW-Ex.

Como a operação é contínua:
- não existe preço de abertura/fechamento de pregão;
- o fechamento diário é uma referência temporal convencional, não uma interrupção de negociação;
- se ocorrerem várias alterações no dia, vale para o fechamento a última alteração efetiva até 23:59:59;
- se não houver alteração naquele dia, o fechamento será o último preço conhecido e vigente às 23:59:59, herdado do evento anterior;
- o sistema deve distinguir fechamento carregado de dia sem alteração, para não sugerir que houve movimento naquele dia.

A escolha do fuso horário ainda precisa de aprovação. A expressão 23:59:59 só é inequívoca depois dessa definição. Internamente, os instantes devem ser armazenados com timezone (preferencialmente UTC) e convertidos para o fuso de referência do mercado ao calcular o dia.

## 3. Consultas por intervalo e granularidade

O usuário escolhe o período e a granularidade desejada. O sistema consulta os eventos efetivos dentro do intervalo e constrói o gráfico.

Exemplos:
- **Por evento:** todos os eventos de alteração ocorridos no intervalo escolhido.
- **Intradiário:** eventos efetivos ocorridos no dia selecionado.
- **Por hora:** eventos efetivos de cada intervalo horário selecionado; não inventar movimento quando nenhum evento ocorreu.
- **Diário:** um ponto de fechamento por dia, calculado pelo preço vigente às 23:59:59.
- **Semanal/mensal ou intervalos maiores:** agregações temporais definidas sobre a mesma série de eventos, com regra explícita para o valor representativo do período.

A seleção do filtro não deve criar eventos nem alterações fictícias. Em intervalos sem eventos:
- para a visão por evento, não há ponto de alteração;
- para a visão de fechamento diário, o preço vigente no instante de fechamento é carregado do último evento conhecido;
- a interface deve sinalizar ausência de alteração no período e, quando útil, a idade do último evento.

## 4. Semântica dos pontos de gráfico

É necessário distinguir:
- **evento de preço:** mudança efetiva, com timestamp e preço anterior/novo;
- **fechamento diário:** preço vigente no instante de referência 23:59:59;
- **ponto agregado:** representação calculada para um intervalo selecionado, de acordo com regra explícita.

Não chamar todo ponto de gráfico de evento. Um fechamento diário pode ser derivado mesmo quando não ocorreu evento naquele dia.

Para intervalos horários, recomenda-se inicialmente mostrar apenas eventos efetivos com seus timestamps, em vez de criar candles OHLC artificiais. Caso no futuro se deseje representação OHLC por hora/dia, será necessário aprovar a semântica de abertura, máxima, mínima e fechamento de cada bucket.

## 5. Regra de consulta proposta

1. Receber início, fim, granularidade e fuso de apresentação.
2. Consultar eventos de preço no intervalo, ordenados pelo instante efetivo e desempate determinístico.
3. Obter também o último preço anterior ao início, para estabelecer o estado inicial do gráfico.
4. Para granularidade por evento, plotar cada alteração efetiva.
5. Para granularidade diária, calcular o preço vigente em cada instante diário de referência 23:59:59.
6. Para intervalos sem evento, não inventar variação; aplicar carry-forward apenas às visões de estado/fechamento, identificando que o preço foi carregado.
7. Retornar ao frontend os pontos, timestamps, tipo de ponto (evento/fechamento/agregado), origem e indicação de ausência de evento.

## 6. Pontos ainda sujeitos a avaliação/aprovação

- Fuso horário oficial do mercado MW-Ex (por exemplo, America/Sao_Paulo ou UTC).
- Inclusividade dos limites inicial/final e precisão do instante de fechamento (23:59:59 ou limite exclusivo do dia seguinte).
- Granularidades que serão oferecidas inicialmente na UI.
- Tratamento de dias anteriores ao primeiro evento histórico.
- Retenção, paginação e limites de consulta.
- Se a visão horária será apenas eventos efetivos ou futuramente OHLC.
- Se semanal/mensal será oferecida inicialmente ou derivada depois.

## 7. Estado desta atualização

- **Esclarecido pelo responsável:** o mercado funciona 24 horas; o fechamento diário corresponde ao preço vigente às 23:59:59; filtros intradiários/horários devem mostrar eventos efetivamente ocorridos no período.
- **Recomendação:** usar uma série histórica primária de eventos e derivar fechamento/agregações em consulta; não criar registros fictícios nos períodos sem alteração.
- **Não decidido:** fuso oficial, granularidades iniciais, limites e regras completas de agregação.
- **Não implementado:** nenhum banco, consulta, API ou gráfico foi alterado.
- **Próximo gate:** aprovar a semântica temporal e recuperar acesso ao schema Supabase para projetar a consulta e o armazenamento em cima da estrutura real.

