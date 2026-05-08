'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, generateRoomCode } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Por favor, digite seu nome');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const code = generateRoomCode();

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          status: 'lobby',
          lives: 3,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { error: playerError } = await supabase.from('players').insert({
        room_id: room.id,
        name: playerName.trim(),
        is_host: true,
      });

      if (playerError) throw playerError;

      sessionStorage.setItem(`playerName_${code}`, playerName.trim());
      sessionStorage.setItem(`isHost_${code}`, 'true');

      router.push(`/room/${code}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Erro ao criar sala. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Por favor, digite seu nome');
      return;
    }

    if (!roomCode.trim()) {
      setError('Por favor, digite o código da sala');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const code = roomCode.trim().toUpperCase();

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single();

      if (roomError || !room) {
        setError('Sala não encontrada');
        setIsJoining(false);
        return;
      }

      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      if (count && count >= 10) {
        setError('Sala cheia (máximo 10 jogadores)');
        setIsJoining(false);
        return;
      }

      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .eq('name', playerName.trim())
        .single();

      if (existingPlayer) {
        setError('Nome já está sendo usado nesta sala');
        setIsJoining(false);
        return;
      }

      const { error: playerError } = await supabase.from('players').insert({
        room_id: room.id,
        name: playerName.trim(),
        is_host: false,
      });

      if (playerError) throw playerError;

      sessionStorage.setItem(`playerName_${code}`, playerName.trim());
      sessionStorage.setItem(`isHost_${code}`, 'false');

      router.push(`/room/${code}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Erro ao entrar na sala. Tente novamente.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            ITO
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Jogo de pistas e ordenação</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Seu nome
            </label>
            <input
              id="name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={20}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (roomCode) handleJoinRoom();
                  else handleCreateRoom();
                }
              }}
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Código da sala (opcional)
            </label>
            <input
              id="code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition uppercase placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && roomCode) {
                  handleJoinRoom();
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !playerName.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {isCreating ? 'Criando...' : 'Criar Nova Sala'}
          </button>

          <button
            onClick={handleJoinRoom}
            disabled={isJoining || !playerName.trim() || !roomCode.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {isJoining ? 'Entrando...' : 'Entrar na Sala'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="font-semibold text-gray-300 mb-3 text-sm">Como jogar:</h3>
          <ol className="text-xs sm:text-sm text-gray-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Cada jogador recebe um número secreto (1-100)</li>
            <li>Escolha um tema subjetivo</li>
            <li>Dê uma pista relacionada ao tema</li>
            <li>Ordene os jogadores do menor ao maior</li>
            <li>Revele os números e veja se acertou!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
