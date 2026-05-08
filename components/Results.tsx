import { Player } from '@/types/game';
import { sortPlayersByPosition, checkOrder, countErrors } from '@/lib/gameLogic';
import { Trophy, XCircle, RotateCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResultsProps {
  players: Player[];
  theme: string;
  lives: number;
  isHost: boolean;
  onPlayAgain: () => void;
}

export default function Results({ players, theme, lives, isHost, onPlayAgain }: ResultsProps) {
  const router = useRouter();
  const sortedPlayers = sortPlayersByPosition(players);
  const isCorrect = checkOrder(sortedPlayers);
  const errors = countErrors(sortedPlayers);

  const handleGoHome = () => {
    localStorage.removeItem('playerName');
    localStorage.removeItem('roomCode');
    localStorage.removeItem('isHost');
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          {isCorrect ? (
            <div className="space-y-4">
              <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
              <h2 className="text-4xl font-bold text-green-600">Parabéns!</h2>
              <p className="text-xl text-gray-700">Vocês ordenaram corretamente!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <XCircle className="w-20 h-20 mx-auto text-red-500" />
              <h2 className="text-4xl font-bold text-red-600">Quase lá!</h2>
              <p className="text-xl text-gray-700">
                {errors === 1 ? '1 erro encontrado' : `${errors} erros encontrados`}
              </p>
            </div>
          )}

          <div className="mt-6 inline-block bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full">
            <span className="text-sm text-gray-600">Tema: </span>
            <span className="font-semibold text-purple-700">{theme}</span>
          </div>

          {!isCorrect && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-4">
                <span className="text-gray-600">Vidas restantes:</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${
                        i < lives - 1
                          ? 'bg-gradient-to-br from-red-500 to-pink-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ordem Final:</h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => {
              // Check if this position is wrong
              const isWrong =
                index > 0 &&
                player.number !== null &&
                sortedPlayers[index - 1].number !== null &&
                player.number! < sortedPlayers[index - 1].number!;

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                    isWrong
                      ? 'border-red-300 bg-red-50'
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>

                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {player.number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-600 truncate">{player.clue}</div>
                  </div>

                  {isWrong && (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isHost ? (
          <div className="space-y-3">
            {lives > 1 && !isCorrect ? (
              <button
                onClick={onPlayAgain}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Tentar Novamente ({lives - 1} {lives - 1 === 1 ? 'vida' : 'vidas'} restantes)
              </button>
            ) : (
              <button
                onClick={onPlayAgain}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Nova Rodada
              </button>
            )}

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            Aguardando o host decidir a próxima ação...
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{sortedPlayers.length}</div>
              <div className="text-sm text-gray-600">Jogadores</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-600">
                {isCorrect ? '100%' : `${Math.round(((sortedPlayers.length - errors) / (sortedPlayers.length - 1)) * 100)}%`}
              </div>
              <div className="text-sm text-gray-600">Precisão</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
