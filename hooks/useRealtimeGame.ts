import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Room, Player, ChatMessage } from '@/types/game';

export const useRealtimeGame = (roomCode: string, pausePolling = false) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchGameData = async () => {
      try {
        // Fetch room data
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single();

        if (roomError) throw roomError;
        if (!mounted) return;

        setRoom(roomData);

        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomData.id)
          .order('joined_at', { ascending: true });

        if (playersError) throw playersError;
        if (!mounted) return;

        setPlayers(playersData || []);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomData.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        if (!mounted) return;

        setMessages(messagesData || []);

        if (loading && mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching game data:', err);
        if (mounted) {
          setError('Erro ao conectar com a sala');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchGameData();

    // Poll for updates every 2 seconds (but pause when needed)
    pollInterval = setInterval(() => {
      if (mounted && !pausePolling) {
        fetchGameData();
      }
    }, 2000);

    // Cleanup
    return () => {
      mounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [roomCode, loading, pausePolling]);

  return {
    room,
    players,
    messages,
    loading,
    error,
  };
};
