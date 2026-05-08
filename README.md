# ITO - Jogo Online de Pistas e Ordenação

Um jogo multiplayer online inspirado no jogo de cartas ITO, onde os jogadores precisam se ordenar usando apenas pistas subjetivas relacionadas a um tema.

## Como Funciona

1. **Criar/Entrar em uma Sala**: Um jogador cria uma sala e compartilha o código com os amigos
2. **Escolher um Tema**: O host escolhe um tema subjetivo (ex: "coisas assustadoras", "comidas gostosas")
3. **Receber Número Secreto**: Cada jogador recebe um número aleatório de 1 a 100
4. **Dar uma Pista**: Cada jogador dá uma pista relacionada ao tema que represente seu número
5. **Ordenar**: Os jogadores discutem e tentam se ordenar do menor ao maior número
6. **Revelar**: Os números são revelados e o grupo vê se acertou a ordem!

## Tecnologias Utilizadas

- **Next.js 14** - Framework React para aplicações web
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS para estilização
- **Supabase** - Backend-as-a-Service (PostgreSQL + Realtime)
- **DND Kit** - Biblioteca para drag-and-drop
- **Vercel** - Plataforma de deploy

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd ito-online
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. No SQL Editor, execute o script em `supabase/migrations/001_initial_schema.sql`
4. Copie as credenciais do projeto (URL e Anon Key)

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha com suas credenciais do Supabase:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 5. Execute o projeto localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

### 1. Faça push do código para o GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio-github>
git push -u origin main
```

### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Importe seu repositório do GitHub
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em "Deploy"

## Estrutura do Projeto

```
ito-online/
├── app/                      # Páginas Next.js
│   ├── page.tsx             # Página inicial (criar/entrar sala)
│   └── room/[code]/         # Página da sala de jogo
│       └── page.tsx
├── components/              # Componentes React
│   ├── Lobby.tsx           # Sala de espera
│   ├── ThemeSelector.tsx   # Seleção de tema
│   ├── ClueInput.tsx       # Entrada de pistas
│   ├── SortablePlayers.tsx # Ordenação drag-and-drop
│   └── Results.tsx         # Tela de resultados
├── hooks/                   # Custom hooks
│   └── useRealtimeGame.ts  # Hook para sincronização realtime
├── lib/                     # Bibliotecas e utilitários
│   ├── supabase.ts         # Cliente Supabase
│   └── gameLogic.ts        # Lógica do jogo
├── types/                   # Tipos TypeScript
│   └── game.ts             # Interfaces do jogo
└── supabase/               # Migrations do banco de dados
    └── migrations/
        └── 001_initial_schema.sql
```

## Funcionalidades

- ✅ Sistema de salas com códigos únicos (estilo Kahoot)
- ✅ Multiplayer em tempo real (até 10 jogadores)
- ✅ 8 temas pré-cadastrados + temas personalizados
- ✅ Distribuição aleatória de números (1-100)
- ✅ Validação de pistas (sem números ou palavras proibidas)
- ✅ Sistema drag-and-drop para ordenação
- ✅ Verificação automática de acertos
- ✅ Sistema de vidas (3 tentativas)
- ✅ Interface responsiva (mobile-first)
- ✅ Sincronização em tempo real entre jogadores

## Regras do Jogo

### Pistas Válidas

- ✅ Devem ser relacionadas ao tema
- ✅ Devem refletir a intensidade do número (1-100)
- ✅ Devem ser subjetivas e abertas a interpretação

### Pistas Proibidas

- ❌ Não podem conter números
- ❌ Não podem usar palavras como "nota", "nível", "máximo", "mínimo"
- ❌ Não podem fazer comparações diretas com outros jogadores
- ❌ Não podem ser óbvias demais

## Configurações Avançadas

### Ajustar número de vidas

Edite o arquivo `app/page.tsx` e altere o valor padrão em `lives`:

```typescript
const { data: room, error: roomError } = await supabase
  .from('rooms')
  .insert({
    code,
    status: 'lobby',
    lives: 3, // Altere aqui
  })
```

### Ajustar limite de jogadores

Edite o arquivo `app/page.tsx` e altere o valor em `handleJoinRoom`:

```typescript
if (count && count >= 10) { // Altere aqui
  setError('Sala cheia');
  return;
}
```

### Adicionar novos temas

Execute no SQL Editor do Supabase:

```sql
INSERT INTO themes (name, description, examples) VALUES
('Seu Tema', 'Descrição do tema', ARRAY['exemplo1', 'exemplo2', 'exemplo3']);
```

## Troubleshooting

### Erro ao conectar com Supabase

- Verifique se as variáveis de ambiente estão corretas
- Verifique se o projeto Supabase está ativo
- Verifique se as políticas RLS (Row Level Security) estão configuradas

### Realtime não funciona

- Verifique se o Realtime está habilitado no seu projeto Supabase
- Verifique as políticas de acesso nas tabelas
- Confira os logs do navegador (F12) para erros

### Problemas com drag-and-drop no mobile

- O @dnd-kit/core suporta touch events nativamente
- Certifique-se de que não há conflitos com scroll

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto é open source e está disponível sob a licença MIT.

## Créditos

Inspirado no jogo de cartas **ITO** criado por Jun Sasaki.
