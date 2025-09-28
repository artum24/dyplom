import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Floor, Zone } from './types';

interface MapBuilderState {
  floors: Floor[];
  selectedFloorIndex: number | null;
  selectedZoneId: string | null;

  setFloors: (floors: Partial<Floor>[]) => void;
  addFloor: (floor: Omit<Floor, 'zones'> & { zones?: Zone[] }) => void;
  renameFloor: (id: string, name: string) => void;
  removeFloor: (id: string) => void;

  setSelectedFloorIndex: (index: number | null) => void;
  setSelectedZoneId: (id: string | null) => void;

  addZoneToCurrentFloor: (zone: Zone) => void;
  updateZoneInCurrentFloor: (zone: Zone) => void;
  removeZoneFromCurrentFloor: (id: string) => void;
}

export const useMapBuilder = create<MapBuilderState>()(
  persist(
    (set, get) => ({
      floors: [],
      selectedFloorIndex: null,
      selectedZoneId: null,

      setFloors: (rawFloors) => {
        const floors: Floor[] = (rawFloors ?? []).map((f) => ({
          id: f.id as string,
          name: f.name as string,
          idx: (f.idx as number) ?? 0,
          zones: Array.isArray((f as any).zones) ? ((f as any).zones as Zone[]) : [],
        }));
        set((s) => ({
          floors,
          selectedFloorIndex:
            s.selectedFloorIndex != null && floors[s.selectedFloorIndex]
              ? s.selectedFloorIndex
              : floors.length
                ? 0
                : null,
        }));
      },

      addFloor: (floor) =>
        set((s) => {
          const f: Floor = { ...floor, zones: floor.zones ?? [] } as Floor;
          const floors = [...s.floors, f];
          return {
            floors,
            selectedFloorIndex: s.selectedFloorIndex ?? 0,
          };
        }),

      renameFloor: (id, name) =>
        set((s) => ({
          floors: s.floors.map((f) => (f.id === id ? { ...f, name } : f)),
        })),

      removeFloor: (id) =>
        set((s) => {
          const idxToRemove = s.floors.findIndex((f) => f.id === id);
          if (idxToRemove === -1) return {} as any;
          const floors = s.floors.filter((f) => f.id !== id);
          let selectedFloorIndex = s.selectedFloorIndex;
          if (selectedFloorIndex != null) {
            if (idxToRemove < selectedFloorIndex) selectedFloorIndex -= 1;
            if (selectedFloorIndex >= floors.length)
              selectedFloorIndex = floors.length ? floors.length - 1 : null;
          }
          return { floors, selectedFloorIndex };
        }),

      setSelectedFloorIndex: (index) =>
        set((s) => ({
          selectedFloorIndex: index != null && s.floors[index] ? index : null,
          selectedZoneId: null,
        })),

      setSelectedZoneId: (id) => set({ selectedZoneId: id }),

      addZoneToCurrentFloor: (zone) => {
        const { floors, selectedFloorIndex } = get();
        if (selectedFloorIndex == null || !floors[selectedFloorIndex]) return;
        const f = floors[selectedFloorIndex];
        const next: Floor = { ...f, zones: [...f.zones, zone] };
        const newFloors = [...floors];
        newFloors[selectedFloorIndex] = next;
        set({ floors: newFloors });
      },

      updateZoneInCurrentFloor: (zone) => {
        const { floors, selectedFloorIndex } = get();
        if (selectedFloorIndex == null || !floors[selectedFloorIndex]) return;
        const f = floors[selectedFloorIndex];
        const next: Floor = {
          ...f,
          zones: f.zones.map((z) => (z.id === zone.id ? zone : z)),
        };
        const newFloors = [...floors];
        newFloors[selectedFloorIndex] = next;
        set({ floors: newFloors });
      },

      removeZoneFromCurrentFloor: (id) => {
        const { floors, selectedFloorIndex, selectedZoneId } = get();
        if (selectedFloorIndex == null || !floors[selectedFloorIndex]) return;
        const f = floors[selectedFloorIndex];
        const next: Floor = { ...f, zones: f.zones.filter((z) => z.id !== id) };
        const newFloors = [...floors];
        newFloors[selectedFloorIndex] = next;
        set({
          floors: newFloors,
          selectedZoneId: selectedZoneId === id ? null : selectedZoneId,
        });
      },
    }),
    {
      name: 'map-builder',
    }
  )
);
