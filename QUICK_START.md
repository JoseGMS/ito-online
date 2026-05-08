# Quick Start - ITO Online

Guia rápido para começar a usar o projeto.

## Status Atual

✅ **Projeto configurado e pronto para usar!**

- ✅ Next.js 14 com TypeScript
- ✅ Tailwind CSS configurado
- ✅ Supabase conectado e funcionando
- ✅ Banco de dados criado com 8 temas pré-cadastrados
- ✅ Todos os componentes implementados
- ✅ Build testado e funcionando

## Como Usar Localmente

### 1. Executar o projeto

```bash
npm run dev
```

O site estará disponível em: **http://localhost:3000**

### 2. Testar o jogo

1. Abra o navegador em `http://localhost:3000`
2. Digite seu nome e clique em "Criar Nova Sala"
3. Copie o código da sala
4. Abra outra aba/janela anônima
5. Cole o código e entre na sala com outro nome
6. O host pode iniciar o jogo quando tiver pelo menos 3 jogadores

## Fluxo do Jogo

```
1. LOBBY
   ↓ Host clica em "Começar Jogo"

2. SELEÇÃO DE TEMA
   ↓ Host escolhe um tema

3. DISTRIBUIÇÃO DE NÚMEROS
   ↓ Cada jogador recebe um número secreto (1-100)

4. ENVIO DE PISTAS
   ↓ Cada jogador escreve uma pista relacionada ao tema

5. ORDENAÇÃO (automático após todos enviarem pistas)
   ↓ Jogadores arrastam e organizam a ordem

6. RESULTADOS (automático após todos confirmarem)
   ↓ Mostra se acertaram + opção de jogar novamente
```

## Próximos Passos

### Para Deploy

Siga o guia completo: [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)

Resumo rápido:
1. Crie repositório no GitHub
2. Faça push do código
3. Importe na Vercel
4. Configure as variáveis de ambiente
5. Deploy automático!

### Para Customizar

#### Adicionar novos temas

Execute no SQL Editor do Supabase:

```sql
INSERT INTO themes (name, description, examples) VALUES
('Seu Tema', 'Descrição', ARRAY['exemplo1', 'exemplo2', 'exemplo3']);
```

#### Alterar número de vidas

Edite `app/page.tsx`, linha ~34:

```typescript
lives: 3, // Mude para o número desejado
```

#### Alterar limite de jogadores

Edite `app/page.tsx`, linha ~101:

```typescript
if (count && count >= 10) { // Mude 10 para o limite desejado
```

## Arquitetura

### Frontend (Next.js)
- **Páginas**:
  - `/` - Home (criar/entrar sala)
  - `/room/[code]` - Sala de jogo

### Backend (Supabase)
- **Tabelas**:
  - `rooms` - Salas ativas
  - `players` - Jogadores em cada sala
  - `themes` - Temas disponíveis
  - `game_results` - Histórico
  - `chat_messages` - Mensagens (futuro)

- **Realtime**:
  - Sincronização automática entre jogadores
  - Atualização instantânea de status

### Estado do Jogo

Estados possíveis:
- `lobby` - Esperando jogadores
- `choosing_theme` - Host escolhendo tema
- `giving_clues` - Jogadores escrevendo pistas
- `sorting` - Jogadores ordenando
- `results` - Mostrando resultados

## Recursos Implementados

### Página Home
- ✅ Criar sala (gera código único de 6 caracteres)
- ✅ Entrar em sala (com validações)
- ✅ Validação de nome duplicado
- ✅ Limite de 10 jogadores por sala

### Lobby
- ✅ Mostrar código da sala
- ✅ Botão copiar código
- ✅ Lista de jogadores
- ✅ Indicador de host
- ✅ Validação de mínimo 3 jogadores

### Seleção de Tema
- ✅ 8 temas pré-cadastrados
- ✅ Opção de tema personalizado
- ✅ Preview de exemplos

### Entrada de Pistas
- ✅ Mostrar número secreto do jogador
- ✅ Validação de pistas (sem números, sem palavras proibidas)
- ✅ Barra de progresso dos jogadores
- ✅ Auto-avanço quando todos enviarem

### Ordenação
- ✅ Drag and drop intuitivo
- ✅ Funciona em mobile (touch)
- ✅ Confirmação individual
- ✅ Auto-revelação quando todos confirmarem

### Resultados
- ✅ Verificação automática de ordem correta
- ✅ Contagem de erros
- ✅ Sistema de vidas
- ✅ Opção de jogar novamente
- ✅ Estatísticas (precisão, número de jogadores)

### Realtime
- ✅ Sincronização instantânea entre jogadores
- ✅ Entrada/saída de jogadores em tempo real
- ✅ Mudanças de estado do jogo
- ✅ Atualização de pistas e ordenação

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build (produção)
npm run build

# Iniciar build de produção
npm start

# Verificar TypeScript
npm run lint
```

## Troubleshooting Rápido

### Erro ao criar sala
- Verifique se o Supabase está online
- Confira as variáveis de ambiente no `.env.local`

### Realtime não funciona
- Vá no Supabase: Database → Replication
- Ative para: `rooms`, `players`, `chat_messages`

### Build falha
```bash
# Limpar cache e reinstalar
rm -rf .next node_modules
npm install
npm run build
```

## Suporte

- 📖 Documentação completa: [README.md](README.md)
- 🔧 Setup Supabase: [SETUP_SUPABASE.md](SETUP_SUPABASE.md)
- 🚀 Deploy Vercel: [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)

## Checklist de Lançamento

Antes de compartilhar o jogo:

- [ ] Supabase configurado corretamente
- [ ] Variáveis de ambiente definidas
- [ ] Build local funcionando (`npm run build`)
- [ ] Testado com pelo menos 3 jogadores
- [ ] Realtime funcionando entre dispositivos
- [ ] Deploy na Vercel concluído
- [ ] Domínio configurado (opcional)

## Próximas Melhorias Sugeridas

Funcionalidades que podem ser adicionadas:

- [ ] Sistema de chat durante fase de discussão
- [ ] Timer para cada fase
- [ ] Histórico de jogos
- [ ] Ranking de jogadores
- [ ] Modo competitivo com pontuação
- [ ] Sons e efeitos visuais
- [ ] Avatares personalizados
- [ ] Modo escuro
- [ ] Compartilhamento direto (WhatsApp, etc)
- [ ] PWA (Progressive Web App)

Boa sorte com seu projeto! 🎮
