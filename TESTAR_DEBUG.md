# Como Testar e Ver os Logs de Debug

## Passo 1: Limpar Tudo

1. Abra o Console do Navegador (F12)
2. Na aba Console, execute:
```javascript
localStorage.clear()
```

3. **Feche TODAS as abas** do localhost:3000

## Passo 2: Criar Nova Sala (ABA 1)

1. Abra `http://localhost:3000`
2. Digite seu nome: **"Host"**
3. Clique em "Criar Nova Sala"
4. **Abra o Console** (F12) → aba "Console"

**O que você deve ver no console:**
```
👤 Você: Host | Host: true
🔄 Lobby atualizado - Jogadores: 1 | Você é o host: true
```

**O que você deve ver na tela:**
- Banner amarelo: "👑 Você é o Host desta sala"
- Botão desabilitado: "Aguardando jogadores..."

## Passo 3: Entrar com Segundo Jogador (ABA 2)

1. Abra uma **NOVA ABA** (ou janela anônima)
2. Vá em `http://localhost:3000`
3. Digite outro nome: **"Jogador1"**
4. Cole o código da sala
5. Clique em "Entrar na Sala"
6. **Abra o Console** (F12) → aba "Console"

**O que você deve ver no console da ABA 2:**
```
👤 Você: Jogador1 | Host: false
🔄 Lobby atualizado - Jogadores: 2 | Você é o host: false
```

**O que você deve ver na tela da ABA 2:**
- SEM banner amarelo
- Mensagem: "Aguardando o host iniciar o jogo..."

## Passo 4: VOLTAR para ABA 1 (Host)

**IMPORTANTE**: Volte para a primeira aba (onde você é o Host)

### ✅ Comportamento CORRETO (esperado):

No console:
```
👤 Você: Host | Host: true
🔄 Lobby atualizado - Jogadores: 2 | Você é o host: true
```

Na tela:
- Banner amarelo AINDA VISÍVEL: "👑 Você é o Host desta sala"
- Jogadores: 2/10
- Botão desabilitado: "Aguardando jogadores..." (precisa de 3)

### ❌ Se o problema continuar:

No console, você verá algo como:
```
👤 Você: Host | Host: false   ← ERRADO! Deveria ser true
🔄 Lobby atualizado - Jogadores: 2 | Você é o host: false
```

Na tela:
- SEM banner amarelo
- Mensagem: "Aguardando o host iniciar o jogo..."

## Passo 5: Copie os Logs e Me Envie

Se o problema continuar:

1. Tire um print do console da **ABA 1** (Host)
2. Tire um print do console da **ABA 2** (Jogador)
3. Me envie exatamente o que apareceu, incluindo:
   - Mensagens com 👤
   - Mensagens com 🔄
   - Qualquer erro vermelho

## Comandos Úteis para Debug

Execute no console:

```javascript
// Ver o que está no localStorage
console.log('LocalStorage:', {
  playerName: localStorage.getItem(`playerName_${window.location.pathname.split('/')[2]}`),
  isHost: localStorage.getItem(`isHost_${window.location.pathname.split('/')[2]}`)
});

// Ver todas as chaves do localStorage
console.log('Todas as chaves:', Object.keys(localStorage));
```

## O Que Estamos Procurando

1. **O localStorage está salvando corretamente?**
   - Deve ter chaves separadas por sala: `playerName_ABC123`, `isHost_ABC123`

2. **O banco de dados tem o is_host correto?**
   - No log `👤 Você: Host | Host: true` - o segundo valor vem do banco

3. **O componente Lobby está recebendo isHost correto?**
   - No log `🔄 Lobby atualizado | Você é o host: true`

Envie-me essas informações! 🔍
