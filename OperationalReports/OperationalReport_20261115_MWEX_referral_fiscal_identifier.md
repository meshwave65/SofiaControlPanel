# Relatório Operacional — MW-Ex — Cadastro por indicação com identificador fiscal

**Data:** 2026-11-15 21:18 (America/Sao_Paulo)  
**Missão relacionada:** 0021 — MW-Ex Proprietária Funcional e Autônoma  
**Escopo:** melhoria local no repositório `meshwave65/newsite`; complemento de onboarding, sem nova tarefa 21.x criada ou encerrada.  
**Status:** IMPLEMENTADO LOCALMENTE; não publicado.

## Solicitação

Evitar que novos MeshWalkers vindos do link de indicação precisem interromper a aquisição para preencher os dados fiscais. O cadastro deve solicitar CPF (Brasil) ou NIF (Portugal); se o usuário optar por não informar o documento no momento, o número de celular com indicativo do país deve ser persistido no mesmo campo de identificação fiscal do perfil MW-Ex, para substituição posterior.

## Implementação

- `src/pages/ReferralOnboarding.jsx`: acrescentado seletor Brasil/Portugal, entrada obrigatória de CPF/NIF e alternativa explícita de celular provisório. Brasil aceita 55 + DDD + 9 dígitos; Portugal aceita 351 + 9 dígitos. O número é normalizado para dígitos e gravado em `mwc_meshwalker_profiles.tax_id`; usa `tax_id_type=OTHER` enquanto for telefone, e `CPF`/`NIF` quando for documento.
- Os dados de país, tipo e valor também são salvos nos metadados da conta e no perfil MW-Ex no cadastro autenticado.
- `src/pages/MwcWallet.jsx`: se o provedor exigir confirmação de e-mail e o perfil ainda não existir, o primeiro login recupera os dados dos metadados e cria o perfil MW-Ex antes de carregar as ações da carteira. Assim a existência do perfil atende ao gate da aquisição.
- O identificador de celular permanece explicitamente provisório; o próprio usuário pode substituí-lo posteriormente pelo CPF/NIF na seção de cadastro fiscal existente.

## Validação

- `npm ci`: concluído. O npm informou 20 vulnerabilidades nas dependências resolvidas (1 baixa, 4 moderadas e 15 altas); não foi executado `npm audit fix`.
- `npm run build`: passou.
- `npx eslint src/pages/ReferralOnboarding.jsx`: passou.
- `npm run lint` global: falha em 7 erros preexistentes em `api/market-data.js`, `src/pages/MeshwalkerWallet.jsx`, `src/pages/MwEx.jsx`, `src/pages/MwcWallet.jsx` e `vite.config.js`; há também 2 avisos preexistentes em `src/pages/Multifluxo.jsx`. Nenhum erro novo foi apontado no arquivo de onboarding.
- `git diff --check`: passou.

## Limites e handoff

Nenhuma migration foi aplicada, consulta autenticada, escrita em banco remoto, criação de conta real, alteração de saldo, publicação ou deploy foi executado. Alterações permanecem apenas no clone local; os dois repositórios continuam sem commit/push nesta execução. Handoff para revisão e deploy autorizados à parte. As tarefas 21.4, 21.5, 21.7 e 21.8 mantêm seus status anteriores; a tarefa 21.6 também não foi reaberta ou encerrada por este complemento.
