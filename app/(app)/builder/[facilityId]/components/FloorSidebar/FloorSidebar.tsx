'use client';

import { useFloors } from '../../../../../../hooks/useFloors';
import { useState } from 'react';
import { useMapBuilder } from '../../../../../../store/builder/builder';

export default function FloorSidebar({ facilityId }: { facilityId: string }) {
  const { floors, addFloor, renameFloor, removeFloor } = useFloors(facilityId);
  const { selectedFloorIndex, setSelectedFloorIndex } = useMapBuilder();
  const [newName, setNewName] = useState('');

  return (
    <aside className="w-64 border-r bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Поверхи</h2>

      <ul className="space-y-2">
        {floors.map((floor, idx) => (
          <li
            key={floor.id}
            className={`flex items-center justify-between rounded px-2 py-1 cursor-pointer ${
              idx === selectedFloorIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedFloorIndex(idx)}
          >
            <span className="truncate">{floor.name}</span>
            <div className="flex gap-1">
              <button
                className="text-xs text-gray-500 hover:text-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt('Нова назва поверху:', floor.name);
                  if (name) renameFloor(floor.id, name);
                }}
              >
                ✏️
              </button>
              <button
                className="text-xs text-gray-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Видалити поверх?')) removeFloor(floor.id);
                }}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) {
              addFloor(newName.trim());
              setNewName('');
            }
          }}
          className="flex gap-2"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded border px-2 py-1 text-sm"
            placeholder="Новий поверх"
          />
          <button type="submit" className="rounded bg-blue-600 px-2 py-1 text-sm text-white">
            +
          </button>
        </form>
      </div>
    </aside>
  );
}
