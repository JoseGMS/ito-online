import { useState } from 'react';
import { validateClue } from '@/lib/gameLogic';
import { Player } from '@/types/game';
import { Lock, Send } from 'lucide-react';

interface ClueInputProps {
  theme: string;
  myNumber: number;
  players: Player[];
  onSubmitClue: (clue: string) => void;
  myClue: string | null;
}

export default function ClueInput({
  theme,
  myNumber,
  players,
  onSubmitClue,
  myClue,
}: ClueInputProps) {
  const [clue, setClue] = useState(myClue || '');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(!!myClue);

  const playersWithClues = players.filter((p) => p.clue && p.clue.trim() !== '').length;
  const totalPlayers = players.length;

  const handleSubmit = () => {
    const validation = validateClue(clue);
    if (!validation.valid) {
      setError(validation.reason || 'Pista inválida');
      return;
    }

    setError('');
    setSubmitted(true);
    onSubmitClue(clue);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dê sua pista</h2>
          <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full">
            <span className="text-sm text-gray-600">Tema: </span>
            <span className="font-semibold text-purple-700">{theme}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Lock className="w-6 h-6" />
            <span className="text-2xl font-bold">Seu número: {myNumber}</span>
          </div>
          <p className="text-center text-sm opacity-90">
            Este número é secreto! Não conte para ninguém.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 mb-2">✓ Pista enviada!</div>
              <div className="font-medium text-gray-800 text-lg">{clue}</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso:</span>
                <span className="text-sm font-bold text-blue-600">
                  {playersWithClues} / {totalPlayers}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(playersWithClues / totalPlayers) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Aguardando outros jogadores enviarem suas pistas...
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">Lembre-se:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Não revele seu número para ninguém</li>
                <li>• Aguarde todos enviarem suas pistas</li>
                <li>• Em seguida, vocês poderão discutir e ordenar</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="clue" className="block text-sm font-medium text-gray-700 mb-2">
                Sua pista relacionada ao tema
              </label>
              <input
                id="clue"
                type="text"
                value={clue}
                onChange={(e) => {
                  setClue(e.target.value);
                  setError('');
                }}
                placeholder="Ex: um gatinho fofo (se o tema for 'coisas fofas')"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                maxLength={100}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2 text-sm">Regras importantes:</h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Não use números na sua pista</li>
                <li>• Não use palavras como "nota", "nível", "máximo", etc.</li>
                <li>• A pista deve ser puramente temática</li>
                <li>• Tente refletir a intensidade do seu número (1-100)</li>
              </ul>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!clue.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar Pista
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
