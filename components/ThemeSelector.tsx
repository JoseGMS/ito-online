import { useState, useEffect } from 'react';
import { Theme } from '@/types/game';
import { supabase } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';

interface ThemeSelectorProps {
  isHost: boolean;
  onSelectTheme: (theme: string) => void;
}

export default function ThemeSelector({ isHost, onSelectTheme }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [customTheme, setCustomTheme] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setThemes(data);
    } catch (err) {
      console.error('Error loading themes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const themeToUse = showCustom ? customTheme.trim() : selectedTheme;
    if (themeToUse) {
      onSelectTheme(themeToUse);
    }
  };

  if (!isHost) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Aguardando tema...
          </h2>
          <p className="text-gray-600">O host está escolhendo o tema da rodada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Escolha o Tema
        </h2>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowCustom(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                !showCustom
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Temas Prontos
            </button>
            <button
              onClick={() => setShowCustom(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                showCustom
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tema Personalizado
            </button>
          </div>

          {!showCustom ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando temas...</div>
              ) : (
                themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.name)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedTheme === theme.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 mb-1">{theme.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{theme.description}</p>
                    {theme.examples && theme.examples.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {theme.examples.slice(0, 3).map((example, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="custom-theme" className="block text-sm font-medium text-gray-700 mb-2">
                Digite seu tema personalizado
              </label>
              <input
                id="custom-theme"
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="Ex: Coisas que dão medo, Comidas deliciosas..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                maxLength={100}
              />
              <p className="mt-2 text-sm text-gray-500">
                Dica: Escolha algo que permita uma escala de intensidade!
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedTheme && !customTheme.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
        >
          Confirmar Tema
        </button>
      </div>
    </div>
  );
}
