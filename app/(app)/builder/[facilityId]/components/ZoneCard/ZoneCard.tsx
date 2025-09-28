'use client';

import { Zone } from '../../../../../../store/builder/types';

interface Props {
  zone: Zone;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ZoneCard({ zone, isSelected, onSelect, onEdit, onDelete }: Props) {
  return (
    <div
      className={`relative flex h-full w-full flex-col p-1.5 text-[11px] ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ background: zone.color }}
      onClick={onSelect}
    >
      <div className="absolute right-1 top-1 flex gap-1 transition group-hover:opacity-100">
        <button className="action rounded bg-white/60 p-0.5" onClick={onEdit}>
          ✏️
        </button>
        <button className="action rounded bg-white/60 p-0.5" onClick={onDelete}>
          🗑️
        </button>
      </div>
      <div className="font-semibold">{zone.subtitle ?? zone.type}</div>
      {zone.description && <div className="text-white/80">{zone.description}</div>}
    </div>
  );
}
