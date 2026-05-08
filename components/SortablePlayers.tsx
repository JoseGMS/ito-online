import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
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
  onDraggingChange?: (isDragging: boolean) => void;
}

interface SortableItemProps {
  player: Player;
  isDragging?: boolean;
}

function SortableItem({ player, isDragging = false }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: player.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 touch-none">
      <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-purple-400 transition-colors touch-none p-2 -m-2"
          >
            <GripVertical className="w-7 h-7 sm:w-6 sm:h-6" />
          </button>

          <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-lg sm:text-base">
            {player.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-base sm:text-sm">{player.name}</div>
            <div className="text-sm sm:text-xs text-gray-400 truncate flex items-center gap-1 mt-1">
              <MessageCircle className="w-4 h-4 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="truncate">{player.clue}</span>
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
  onDraggingChange,
}: SortablePlayersProps) {
  const [items, setItems] = useState<Player[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasReordered, setHasReordered] = useState(false);

  useEffect(() => {
    // Only update items from props if user hasn't manually reordered yet
    if (!hasReordered) {
      const playersWithClues = players.filter((p) => p.clue);
      setItems(playersWithClues);
    }
  }, [players, hasReordered]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    onDraggingChange?.(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    onDraggingChange?.(false);

    if (over && active.id !== over.id) {
      setHasReordered(true); // Mark that user has manually reordered
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
  const activePlayer = items.find((item) => item.id === activeId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-800">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ordene os Jogadores</h2>
          <div className="inline-block bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700/50 px-4 sm:px-6 py-2 sm:py-3 rounded-full">
            <span className="text-xs sm:text-sm text-gray-400">Tema: </span>
            <span className="font-semibold text-purple-300 text-sm sm:text-base">{theme}</span>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 sm:p-4 mb-6">
          <p className="text-xs sm:text-sm text-blue-300 text-center leading-relaxed">
            <span className="block sm:inline">Arraste os jogadores para organizá-los do </span>
            <strong className="text-blue-200">menor</strong>
            <span> ao </span>
            <strong className="text-blue-200">maior</strong>
            <span> número</span>
          </p>
        </div>

        {confirmed ? (
          <div className="space-y-4">
            <div className="bg-green-900/30 border-2 border-green-600/50 rounded-xl p-5 sm:p-6 text-center">
              <div className="text-green-400 mb-2 text-lg sm:text-base">✓ Ordem confirmada!</div>
              <p className="text-sm text-gray-400">
                Aguardando {isHost ? 'você revelar' : 'o host revelar'} os resultados...
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Jogadores prontos:</span>
                <span className="text-sm font-bold text-purple-400">
                  {sortedCount} / {totalPlayers}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(sortedCount / totalPlayers) * 100}%` }}
                />
              </div>
            </div>

            {isHost && sortedCount === totalPlayers && (
              <button
                onClick={() => onConfirmOrder(items.map((i) => i.id))}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Revelar Resultados
              </button>
            )}
          </div>
        ) : (
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="mb-6 min-h-[200px]">
                  {items.map((player, index) => (
                    <div key={player.id} className="relative">
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold z-10">
                        {index + 1}
                      </div>
                      <SortableItem player={player} />
                    </div>
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activePlayer && (
                  <SortableItem player={activePlayer} isDragging />
                )}
              </DragOverlay>
            </DndContext>

            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg text-base"
            >
              Confirmar Ordem
            </button>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="font-semibold text-gray-300 mb-2 text-sm">💡 Dica:</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Toque e segure para arrastar. Quanto mais intenso relacionado ao tema, maior o número!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
