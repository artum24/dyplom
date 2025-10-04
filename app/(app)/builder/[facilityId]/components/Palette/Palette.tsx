'use client';

import { useMapBuilder } from '../../../../../../store/builder/builder';

export type PresetType = {
  type: string;
  label: string;
  color: string;
  w: number;
  h: number;
};

export const PRESETS = [
  { type: 'room', label: 'Кабінет', color: '#2ECC71', w: 3, h: 3, minW: 2, minH: 2 },
  { type: 'ward', label: 'Палата', color: '#9B59B6', w: 3, h: 3, minW: 2, minH: 2 },
  { type: 'operating', label: 'Операційна', color: '#E74C3C', w: 5, h: 3, minW: 2, minH: 2 },
  { type: 'diagnostics', label: 'Діагностика', color: '#F1C40F', w: 5, h: 3, minW: 2, minH: 2 },
  { type: 'toilet', label: 'Туалет', color: '#7F8C8D', w: 2, h: 2, minW: 2, minH: 2 },
  { type: 'reception', label: 'Реєстратура', color: '#E67E22', w: 5, h: 3, minW: 2, minH: 2 },
  { type: 'exit', label: 'Вихід', color: '#000000', w: 2, h: 1, minW: 2, minH: 1 },
];

export const Palette = () => {
  const setDragItem = useMapBuilder((state) => state.setDragItem);
  return (
    <div className="w-64 border-r bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Типи зон</h2>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <div
            key={p.type}
            draggable
            unselectable="on"
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', '');
              setDragItem(p);
            }}
            className="cursor-grab rounded border p-2 text-center text-sm hover:bg-gray-100"
            style={{ borderColor: p.color }}
          >
            <div className="mx-auto mb-1 h-3 w-3 rounded-full" style={{ background: p.color }} />
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
};
