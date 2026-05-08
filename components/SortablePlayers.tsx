import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Player } from '@/types/game';
import { GripVertical, MessageCircle } from 'lucide-react';

interface SortablePlayersProps {
  players: Player[];
  theme: string;
  isHost: boolean;
  onConfirmOrder: (orderedPlayerIds: string[]) => void;
}

interface SortableItemProps {
  player: Player;
}

function SortableItem({ player }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-6 h-6" />
          </button>

          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {player.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800">{player.name}</div>
            <div className="text-sm text-gray-600 truncate flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {player.clue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SortablePlayers({
  players,
  theme,
  isHost,
  onConfirmOrder,
}: SortablePlayersProps) {
  const [items, setItems] = useState<Player[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Initialize with players that have clues
    const playersWithClues = players.filter((p) => p.clue);
    setItems(playersWithClues);
  }, [players]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleConfirm = () => {
    const orderedIds = items.map((item) => item.id);
    setConfirmed(true);
    onConfirmOrder(orderedIds);
  };

  const sortedCount = players.filter((p) => p.position !== null).length;
  const totalPlayers = players.length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Ordene os Jogadores</h2>
          <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full">
            <span className="text-sm text-gray-600">Tema: </span>
            <span className="font-semibold text-purple-700">{theme}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 text-center">
            Arraste os jogadores para organizá-los do <strong>menor</strong> ao <strong>maior</strong> número
          </p>
        </div>

        {confirmed ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 mb-2">✓ Ordem confirmada!</div>
              <p className="text-sm text-gray-600">
                Aguardando {isHost ? 'você revelar' : 'o host revelar'} os resultados...
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Jogadores prontos:</span>
                <span className="text-sm font-bold text-purple-600">
                  {sortedCount} / {totalPlayers}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(sortedCount / totalPlayers) * 100}%` }}
                />
              </div>
            </div>

            {isHost && sortedCount === totalPlayers && (
              <button
                onClick={() => onConfirmOrder(items.map((i) => i.id))}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95"
              >
                Revelar Resultados
              </button>
            )}
          </div>
        ) : (
          <div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="mb-6">
                  {items.map((player) => (
                    <SortableItem key={player.id} player={player} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Confirmar Ordem
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">Dica:</h3>
              <p className="text-xs text-gray-600">
                Use as pistas para decidir a ordem. Lembre-se: quanto mais intenso relacionado ao tema, maior o número!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
