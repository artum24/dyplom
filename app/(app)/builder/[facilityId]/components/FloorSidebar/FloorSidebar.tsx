'use client';

import { useFloors } from '../../../../../../hooks/useFloors';
import { useState } from 'react';
import { useMapBuilder } from '../../../../../../store/builder/builder';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { RemoveFloorDialog } from '@/app/(app)/builder/[facilityId]/components/FloorSidebar/components/RemoveFloor/RemoveFloor';
import { EditFloor } from '@/app/(app)/builder/[facilityId]/components/FloorSidebar/components/EditFloor/EditFloor';
import { toast } from 'sonner';

export const FloorSidebar = ({ facilityId }: { facilityId: string }) => {
  const [newName, setNewName] = useState('');
  const { addFloor } = useFloors(facilityId);
  const { selectedFloorIndex, setSelectedFloorIndex, floors } = useMapBuilder();

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
              <EditFloor facilityId={facilityId} floor={floor} />
              <RemoveFloorDialog facilityId={facilityId} floor={floor} />
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
              toast('Поверх успішно додано!');
            }
          }}
          className="flex gap-2"
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded border px-2 py-1 text-sm"
            placeholder="Новий поверх"
          />
          <Button type="submit" className="px-2 text-sm ">
            <Plus width={16} height={16} />
          </Button>
        </form>
      </div>
    </aside>
  );
};
