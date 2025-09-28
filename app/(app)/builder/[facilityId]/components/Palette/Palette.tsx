'use client';

const PRESETS = [
  { type: 'room', label: 'Кабінет', color: '#2ECC71', w: 5, h: 5 },
  { type: 'corridor', label: 'Коридор', color: '#3498DB', w: 10, h: 2 },
  { type: 'ward', label: 'Палата', color: '#9B59B6', w: 6, h: 6 },
  { type: 'operating', label: 'Операційна', color: '#E74C3C', w: 7, h: 6 },
  { type: 'diagnostics', label: 'Діагностика', color: '#F1C40F', w: 6, h: 5 },
  { type: 'toilet', label: 'Туалет', color: '#7F8C8D', w: 3, h: 3 },
  { type: 'reception', label: 'Реєстратура', color: '#E67E22', w: 5, h: 3 },
];

export default function Palette() {
  return (
    <div className="w-64 border-r bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Типи зон</h2>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <div
            key={p.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/x-zone', JSON.stringify(p));
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
}
