# Guia de Configuração do Supabase

Este guia detalha como configurar o Supabase para o projeto ITO.

## Passo 1: Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha os dados:
   - **Name**: ito-online (ou o nome que preferir)
   - **Database Password**: Escolha uma senha forte e guarde em local seguro
   - **Region**: Escolha a região mais próxima dos seus usuários
   - **Pricing Plan**: Free tier é suficiente para começar
4. Aguarde alguns minutos enquanto o projeto é criado

## Passo 2: Executar o Script SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Verifique se não houve erros. Você deve ver a mensagem "Success. No rows returned"

## Passo 3: Verificar as Tabelas

1. Vá em **Table Editor** (menu lateral)
2. Você deve ver as seguintes tabelas:
   - `rooms` - Salas de jogo
   - `players` - Jogadores
   - `themes` - Temas disponíveis
   - `game_results` - Histórico de resultados
   - `chat_messages` - Mensagens de chat

3. Clique em `themes` e verifique se há 8 temas pré-cadastrados

## Passo 4: Habilitar Realtime

1. Vá em **Database** → **Replication** (menu lateral)
2. Procure pelas tabelas: `rooms`, `players`, `chat_messages`
3. Habilite a replicação (toggle) para cada uma dessas tabelas
4. Isso permite sincronização em tempo real

## Passo 5: Copiar Credenciais

1. Vá em **Settings** → **API** (menu lateral)
2. Você verá duas informações importantes:

### Project URL
```
https://xrtuowhsmdhyxulzbkcw.supabase.co
```

### API Keys
Copie a chave **anon/public**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydHVvd2hzbWRoeXh1bHpia2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODM5MzQsImV4cCI6MjA5Mzc1OTkzNH0.9MiMGvbfNbL7TvorZheyiF5IG42cKgHLu0K9PPWMBlI
```

**IMPORTANTE**:
- Nunca compartilhe a chave `service_role` publicamente
- Use apenas a chave `anon/public` no frontend

## Passo 6: Configurar Variáveis de Ambiente

1. No seu projeto local, edite o arquivo `.env.local`
2. Adicione as credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Passo 7: Testar a Conexão

1. Execute o projeto:
```bash
npm run dev
```

2. Abra o navegador em `http://localhost:3000`
3. Tente criar uma sala
4. Se funcionar, a conexão está ok!

## Verificação de Segurança (Row Level Security)

As políticas RLS já foram configuradas no script SQL. Para verificar:

1. Vá em **Authentication** → **Policies**
2. Você deve ver políticas para cada tabela
3. As políticas permitem que qualquer usuário leia e escreva (adequado para um jogo público)

### Políticas Configuradas:

**rooms**
- ✅ Qualquer um pode visualizar salas
- ✅ Qualquer um pode criar salas
- ✅ Salas podem ser atualizadas
- ✅ Salas antigas (>24h) podem ser deletadas

**players**
- ✅ Qualquer um pode visualizar jogadores
- ✅ Qualquer um pode se juntar como jogador
- ✅ Jogadores podem atualizar seus dados
- ✅ Jogadores podem sair

**themes**
- ✅ Qualquer um pode visualizar temas

## Troubleshooting

### Erro: "relation does not exist"
- Verifique se executou o script SQL completamente
- Certifique-se que não houve erros durante a execução

### Erro: "JWT expired" ou "Invalid API key"
- Verifique se copiou a chave correta (anon/public)
- Certifique-se que não há espaços extras nas variáveis de ambiente
- Reinicie o servidor de desenvolvimento

### Realtime não funciona
- Verifique se habilitou a replicação nas tabelas
- Vá em Database → Replication e ative para: rooms, players, chat_messages

### Erro de permissão
- Verifique as políticas RLS em Authentication → Policies
- Certifique-se que as políticas foram criadas corretamente pelo script

## Monitoramento

### Ver logs em tempo real:
1. **Database** → **Logs**
2. Filtre por tipo de log (Postgres, API, Auth, etc.)

### Ver estatísticas de uso:
1. **Settings** → **Usage**
2. Acompanhe: Database size, API requests, Bandwidth

### Limites do Free Tier:
- 500 MB de banco de dados
- 2 GB de transferência
- 50 MB de armazenamento de arquivos
- Até 2 concurrent connections

## Backup

Para fazer backup do banco de dados:

1. Vá em **Database** → **Backups**
2. O plano free mantém backups diários por 7 dias
3. Para fazer backup manual, use:

```bash
pg_dump -h db.xxxxxxxxxx.supabase.co -U postgres -d postgres > backup.sql
```

## Próximos Passos

Após configurar o Supabase:

1. ✅ Configure as variáveis de ambiente
2. ✅ Teste localmente
3. ✅ Configure o deploy na Vercel
4. ✅ Adicione as mesmas variáveis de ambiente na Vercel

## Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Realtime](https://supabase.com/docs/guides/realtime)
- [Guia de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
