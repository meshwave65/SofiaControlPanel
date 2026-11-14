# GitHub Sync - Sincronização Automática

## Visão Geral

O Sofia Control Panel inclui um sistema de sincronização automática com GitHub via Personal Access Token (PAT). Este sistema permite que o projeto seja sincronizado com um repositório remoto, com atualização automática do arquivo `UPDATES.md` a cada commit.

## Configuração

### 1. Criar Personal Access Token (PAT) no GitHub

1. Acesse https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Configure as permissões:
   - `repo` (acesso completo ao repositório)
   - `workflow` (permissão para workflows)
4. Copie o token gerado

### 2. Configurar Variáveis de Ambiente

Defina as seguintes variáveis de ambiente no seu sistema ou no painel de configuração do Manus:

```
GITHUB_PAT=ghp_your_personal_access_token_here
GITHUB_OWNER=seu_usuario_github
GITHUB_REPO=sofia-control-panel
GITHUB_BRANCH=main
```

### 3. Verificar Configuração

Execute o seguinte comando para verificar se a configuração está correta:

```bash
cd /home/ubuntu/SofiaControlPanelApp
node -e "
const config = {
  pat: process.env.GITHUB_PAT ? '***' : 'NOT SET',
  owner: process.env.GITHUB_OWNER || 'NOT SET',
  repo: process.env.GITHUB_REPO || 'NOT SET',
  branch: process.env.GITHUB_BRANCH || 'main'
};
console.log('GitHub Config:', config);
"
```

## Uso

### Sincronizar Manualmente

Para sincronizar alterações com GitHub manualmente, use o módulo `githubSync.ts`:

```typescript
import { syncWithGitHub, syncUpdatesFile } from './server/githubSync';

// Sincronizar com commit customizado
await syncWithGitHub(
  'feat: nova funcionalidade adicionada',
  'Desenvolvimento'
);

// Sincronizar apenas UPDATES.md
await syncUpdatesFile('Atualização de relatório');
```

### Sincronização Automática

O sistema de heartbeat (`server/heartbeat.ts`) sincroniza automaticamente quando:

1. **Relatório de Contexto Gerado**: Ao atingir ~40 créditos, um relatório é gerado e sincronizado
2. **Tarefas Agendadas**: Tarefas agendadas podem disparar sincronizações

## Arquivo UPDATES.md

O arquivo `UPDATES.md` na raiz do repositório é atualizado automaticamente com:

- **Data e Hora**: Timestamp ISO 8601
- **Commit Hash**: Hash curto do commit
- **Fase**: Identificação da fase de desenvolvimento
- **Descrição**: Descrição das alterações

Exemplo de entrada:

```markdown
## [2026-05-27] Relatório de Contexto Automático
**Commit**: `af75016`
**Fase**: Monitoramento
**Timestamp**: 2026-05-27T13:45:30.123Z
```

## Segurança

⚠️ **IMPORTANTE**: 

- Nunca compartilhe seu PAT em repositórios públicos
- Use variáveis de ambiente para armazenar o PAT
- Regenere o PAT periodicamente
- Revogue tokens antigos que não estão mais em uso

## Troubleshooting

### Erro: "Configuração incompleta"

Verifique se todas as variáveis de ambiente estão definidas:

```bash
echo $GITHUB_PAT
echo $GITHUB_OWNER
echo $GITHUB_REPO
```

### Erro: "Falha ao fazer push"

1. Verifique se o PAT tem permissões de `repo`
2. Verifique se o repositório remoto existe
3. Verifique a conectividade com GitHub

### Erro: "Falha ao fazer commit"

1. Verifique se há alterações para fazer commit
2. Verifique se o usuário Git está configurado:
   ```bash
   git config --global user.name
   git config --global user.email
   ```

## Referências

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Git Documentation](https://git-scm.com/doc)
- [Sofia Control Panel - UPDATES.md](./UPDATES.md)
