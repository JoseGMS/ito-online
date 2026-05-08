import { Player } from '@/types/game';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

export default function Lobby({ roomCode, players, isHost, onStartGame }: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  console.log('🔄 Lobby atualizado - Jogadores:', players.length, '| Você é o host:', isHost);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sala de Espera
            <span className="ml-3 text-sm text-green-500">● Online</span>
          </h1>

          <div className={`mb-4 inline-block border-2 rounded-lg px-4 py-2 ${
            isHost
              ? 'bg-yellow-100 border-yellow-400'
              : 'bg-blue-100 border-blue-400'
          }`}>
            <span className={`font-semibold ${isHost ? 'text-yellow-800' : 'text-blue-800'}`}>
              {isHost ? '👑 Você é o HOST desta sala' : '👤 Você é um JOGADOR'}
            </span>
          </div>

          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full">
            <span className="text-sm text-gray-600">Código da sala:</span>
            <span className="text-2xl font-mono font-bold text-purple-700">{roomCode}</span>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white rounded-full transition"
              title="Copiar código"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Jogadores ({players.length}/10)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-800">{player.name}</span>
                {player.is_host && (
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {players.length < 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Aguardando mais jogadores... (mínimo 3 para começar)
            </p>
          </div>
        )}

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={players.length < 3}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {players.length < 3 ? 'Aguardando jogadores...' : 'Começar Jogo'}
          </button>
        ) : (
          <div className="text-center text-gray-600">
            Aguardando o host iniciar o jogo...
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">Instruções:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Compartilhe o código da sala com seus amigos</li>
            <li>• Aguarde pelo menos 3 jogadores</li>
            <li>• O host iniciará o jogo quando estiver pronto</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
