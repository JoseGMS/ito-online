'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, generatePlayerNumbers } from '@/lib/supabase';
import { useRealtimeGame } from '@/hooks/useRealtimeGame';
import { allPlayersGaveClues } from '@/lib/gameLogic';
import Lobby from '@/components/Lobby';
import ThemeSelector from '@/components/ThemeSelector';
import ClueInput from '@/components/ClueInput';
import SortablePlayers from '@/components/SortablePlayers';
import Results from '@/components/Results';
import { Loader2 } from 'lucide-react';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [isDragging, setIsDragging] = useState(false);
  const { room, players, loading, error } = useRealtimeGame(roomCode, isDragging);
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Get player info from sessionStorage (unique per tab)
    const storedName = sessionStorage.getItem(`playerName_${roomCode}`);

    if (!storedName) {
      // Redirect to home if no player info for this room
      router.push('/');
      return;
    }

    setPlayerName(storedName);

    // Find my player and check if I'm the host based on database data
    const myPlayer = players.find((p) => p.name === storedName);
    if (myPlayer) {
      setMyPlayerId(myPlayer.id);
      setIsHost(myPlayer.is_host); // Use database value, not localStorage

      // Update sessionStorage to match database
      sessionStorage.setItem(`isHost_${roomCode}`, myPlayer.is_host.toString());

      console.log(`👤 Você: ${storedName} | Host: ${myPlayer.is_host}`);
    }
  }, [players, roomCode, router]);

  const handleStartGame = async () => {
    if (!room) return;

    try {
      // Update room status to choosing_theme
      await supabase.from('rooms').update({ status: 'choosing_theme' }).eq('id', room.id);
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  const handleSelectTheme = async (theme: string) => {
    if (!room) return;

    try {
      // Distribute numbers to players
      const numbers = generatePlayerNumbers(players.length);

      // Update each player with their number
      const updates = players.map((player, index) =>
        supabase
          .from('players')
          .update({ number: numbers[index], position: null, clue: null })
          .eq('id', player.id)
      );

      await Promise.all(updates);

      // Update room with theme and status
      await supabase
        .from('rooms')
        .update({ theme, status: 'giving_clues' })
        .eq('id', room.id);
    } catch (err) {
      console.error('Error selecting theme:', err);
    }
  };

  const handleSubmitClue = async (clue: string) => {
    if (!myPlayerId) return;

    try {
      await supabase.from('players').update({ clue }).eq('id', myPlayerId);
    } catch (err) {
      console.error('Error submitting clue:', err);
    }
  };

  const handleConfirmOrder = async (orderedPlayerIds: string[]) => {
    if (!myPlayerId || !room) return;

    try {
      // Update my position
      const myPosition = orderedPlayerIds.indexOf(myPlayerId);
      await supabase.from('players').update({ position: myPosition }).eq('id', myPlayerId);

      // If host and all players have confirmed, move to results
      if (isHost) {
        // Wait a bit for all updates to complete
        setTimeout(async () => {
          const { data: updatedPlayers } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', room.id);

          if (updatedPlayers && updatedPlayers.every((p) => p.position !== null)) {
            await supabase.from('rooms').update({ status: 'results' }).eq('id', room.id);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Error confirming order:', err);
    }
  };

  const handlePlayAgain = async () => {
    if (!room) return;

    try {
      // Reset players
      await supabase
        .from('players')
        .update({ number: null, clue: null, position: null })
        .eq('room_id', room.id);

      // Update room status back to choosing_theme
      await supabase.from('rooms').update({ status: 'choosing_theme', theme: null }).eq('id', room.id);
    } catch (err) {
      console.error('Error resetting game:', err);
    }
  };

  // Auto-transition from giving_clues to sorting when all clues are submitted
  useEffect(() => {
    if (!room || !isHost || room.status !== 'giving_clues') return;

    if (allPlayersGaveClues(players)) {
      // All players gave clues, move to sorting
      setTimeout(async () => {
        await supabase.from('rooms').update({ status: 'sorting' }).eq('id', room.id);
      }, 1000);
    }
  }, [room, players, isHost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Carregando sala...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Erro</h2>
          <p className="text-gray-300 mb-6">{error || 'Sala não encontrada'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const myPlayer = players.find((p) => p.id === myPlayerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      {room.status === 'lobby' && (
        <Lobby
          roomCode={roomCode}
          players={players}
          isHost={isHost}
          onStartGame={handleStartGame}
        />
      )}

      {room.status === 'choosing_theme' && (
        <ThemeSelector isHost={isHost} onSelectTheme={handleSelectTheme} />
      )}

      {room.status === 'giving_clues' && myPlayer && (
        <ClueInput
          theme={room.theme || ''}
          myNumber={myPlayer.number || 0}
          players={players}
          onSubmitClue={handleSubmitClue}
          myClue={myPlayer.clue}
        />
      )}

      {room.status === 'sorting' && (
        <SortablePlayers
          players={players}
          theme={room.theme || ''}
          isHost={isHost}
          onConfirmOrder={handleConfirmOrder}
          onDraggingChange={setIsDragging}
        />
      )}

      {room.status === 'results' && (
        <Results
          players={players}
          theme={room.theme || ''}
          lives={room.lives}
          isHost={isHost}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
