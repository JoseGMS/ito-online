# Como Habilitar Realtime no Supabase

O jogo está funcionando com **polling** (consultas a cada 2 segundos). Para melhor performance, você pode habilitar o Realtime no Supabase.

## Status Atual

✅ **O jogo funciona sem Realtime** usando polling
⚡ **Recomendado**: Habilitar Realtime para melhor performance

## Como Habilitar Realtime

### Passo 1: Acesse o Supabase

1. Vá em [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. No menu lateral, clique em **Database**
4. Depois clique em **Replication**

### Passo 2: Habilitar Replicação nas Tabelas

Você precisa habilitar a replicação para 3 tabelas:

#### Tabela: rooms
1. Procure por `rooms` na lista
2. Clique no **toggle/switch** ao lado
3. Deve ficar verde/ativo

#### Tabela: players
1. Procure por `players` na lista
2. Clique no **toggle/switch** ao lado
3. Deve ficar verde/ativo

#### Tabela: chat_messages
1. Procure por `chat_messages` na lista
2. Clique no **toggle/switch** ao lado
3. Deve ficar verde/ativo

### Passo 3: Aguardar Propagação

Aguarde cerca de 30-60 segundos para as mudanças se propagarem.

### Passo 4: Ativar Realtime no Código

Depois de habilitar a replicação, você pode trocar para usar Realtime:

1. Abra o arquivo: `hooks/useRealtimeGame.ts`
2. Substitua o conteúdo pelo código com Realtime (veja abaixo)

## Código com Realtime

Se quiser usar Realtime em vez de polling, substitua o conteúdo de `hooks/useRealtimeGame.ts` por:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Room, Player, ChatMessage } from '@/types/game';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeGame = (roomCode: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let mounted = true;

    const setupRealtimeSubscription = async () => {
      try {
        // Fetch initial room data
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single();

        if (roomError) throw roomError;
        if (!mounted) return;

        setRoom(roomData);

        // Fetch initial players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomData.id)
          .order('joined_at', { ascending: true });

        if (playersError) throw playersError;
        if (!mounted) return;

        setPlayers(playersData || []);

        // Fetch initial messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomData.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        if (!mounted) return;

        setMessages(messagesData || []);

        // Setup realtime channel with unique name
        const channelName = \`room:\${roomCode}:\${Date.now()}\`;
        channel = supabase.channel(channelName);

        // Configure all subscriptions before calling subscribe()
        channel
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'rooms',
              filter: \`code=eq.\${roomCode}\`,
            },
            (payload) => {
              if (payload.eventType === 'UPDATE' && mounted) {
                setRoom(payload.new as Room);
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'players',
              filter: \`room_id=eq.\${roomData.id}\`,
            },
            (payload) => {
              if (!mounted) return;

              if (payload.eventType === 'INSERT') {
                setPlayers((prev) => [...prev, payload.new as Player]);
              } else if (payload.eventType === 'UPDATE') {
                setPlayers((prev) =>
                  prev.map((p) => (p.id === payload.new.id ? (payload.new as Player) : p))
                );
              } else if (payload.eventType === 'DELETE') {
                setPlayers((prev) => prev.filter((p) => p.id !== payload.old.id));
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: \`room_id=eq.\${roomData.id}\`,
            },
            (payload) => {
              if (mounted) {
                setMessages((prev) => [...prev, payload.new as ChatMessage]);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Realtime conectado para sala:', roomCode);
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Erro no Realtime - usando polling como fallback');
            }
          });

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error setting up realtime:', err);
        if (mounted) {
          setError('Erro ao conectar com a sala');
          setLoading(false);
        }
      }
    };

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomCode]);

  return {
    room,
    players,
    messages,
    loading,
    error,
  };
};
```

## Diferenças entre Polling e Realtime

### Polling (Atual)
- ✅ Funciona sem configuração adicional
- ✅ Mais simples
- ⚠️ Atualiza a cada 2 segundos
- ⚠️ Mais consumo de banda
- ⚠️ Pequeno delay nas atualizações

### Realtime (Recomendado)
- ⚡ Atualizações instantâneas
- ⚡ Menor consumo de banda
- ⚡ Melhor experiência de usuário
- ⚠️ Requer configuração no Supabase

## Verificar se Realtime está Funcionando

Após habilitar e atualizar o código:

1. Abra o console do navegador (F12)
2. Crie/entre em uma sala
3. Procure por: `✅ Realtime conectado para sala: XXXXXX`
4. Se ver a mensagem, está funcionando!

## Troubleshooting

### Realtime não conecta
- Verifique se habilitou a replicação nas 3 tabelas
- Aguarde 1-2 minutos após habilitar
- Reinicie o servidor de desenvolvimento

### Erro "CHANNEL_ERROR"
- Verifique suas credenciais do Supabase
- Confirme que o projeto está ativo
- Verifique o plano (free tier tem limite de conexões simultâneas)

### Volta ao comportamento antigo
O código atual (com polling) continua funcionando perfeitamente. Você não precisa mudar se estiver satisfeito com o desempenho atual.

## Conclusão

**Recomendação**:
- Para **testar local**: Polling (atual) funciona perfeitamente
- Para **produção**: Habilite Realtime para melhor experiência

O jogo funcionará bem nos dois casos! 🎮
