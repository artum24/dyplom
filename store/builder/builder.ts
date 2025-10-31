import { create } from 'zustand';
import type { Floor, Zone } from './types';
import { supabase } from '@/lib/supabase';
import { PresetType } from '@/app/(app)/builder/[facilityId]/components/Palette/Palette';
import { Layout } from 'react-grid-layout';
import { toast } from 'sonner';

interface MapBuilderState {
  floors: Floor[];
  selectedFloorIndex: number | null;
  dragItem: PresetType | null;
  stateFacilityId: string | null;
  setDragItem: (zone: PresetType | null) => void;
  setFloors: (floors: Partial<Floor>[]) => void;
  addFloor: (floor: Omit<Floor, 'zones'> & { zones?: Zone[] }) => void;
  renameFloor: (id: string, name: string) => void;
  removeFloor: (id: string) => void;

  setSelectedFloorIndex: (index: number | null) => void;
  setStateFacilityId: (id: string | null) => void;
  addZoneToCurrentFloor: (zone: Zone) => void;
  updateZoneInCurrentFloor: (zone: Zone) => void;
  updateZonesInCurrentFloor: (zone: Layout[]) => void;
  removeZoneFromCurrentFloor: (id: string) => void;

  saveZonesToDatabase: (floorId: string) => Promise<void>;
  loadZonesForFloor: (floorId: string) => Promise<void>;
}

export const useMapBuilder = create<MapBuilderState>()((set, get) => ({
  floors: [],
  selectedFloorIndex: null,
  dragItem: null,
  stateFacilityId: null,

  setDragItem: (zone: PresetType | null) => set({ dragItem: zone }),
  setStateFacilityId: (id: string | null) => set({ stateFacilityId: id }),
  setFloors: (rawFloors) => {
    const { floors: existingFloors } = get();
    const existingFloorsMap = new Map(existingFloors.map((f) => [f.id, f]));

    const floors: Floor[] = (rawFloors ?? []).map((f) => {
      const floorId = f.id as string;
      const existingFloor = existingFloorsMap.get(floorId);

      return {
        id: floorId,
        name: f.name as string,
        idx: (f.idx as number) ?? 0,

        zones:
          existingFloor?.zones ||
          (Array.isArray((f as any).zones) ? ((f as any).zones as Zone[]) : []),
      };
    });
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

  setSelectedFloorIndex: (index) => {
    set({ selectedFloorIndex: index });
  },

  addZoneToCurrentFloor: (zone) => {
    const { floors, selectedFloorIndex } = get();
    if (selectedFloorIndex === null) return;

    const newFloors = [...floors];
    const currentZones = [...(newFloors[selectedFloorIndex].zones || [])];

    currentZones.push(zone);

    newFloors[selectedFloorIndex] = {
      ...newFloors[selectedFloorIndex],
      zones: currentZones,
    };

    set({ floors: newFloors });
  },

  updateZoneInCurrentFloor: (zone) => {
    const { floors, selectedFloorIndex } = get();
    if (selectedFloorIndex === null) return;

    const newFloors = [...floors];
    const currentZones = [...(newFloors[selectedFloorIndex].zones || [])];

    const index = currentZones.findIndex((z) => z.id === zone.id);
    if (index === -1) return;

    currentZones[index] = zone;
    newFloors[selectedFloorIndex] = {
      ...newFloors[selectedFloorIndex],
      zones: currentZones,
    };

    set({ floors: newFloors });
  },

  updateZonesInCurrentFloor: (layout: Layout[]) => {
    const { floors, selectedFloorIndex } = get();
    if (selectedFloorIndex === null) return;
    const newFloors = [...floors];
    const zones = newFloors[selectedFloorIndex].zones;
    const transformZones: Zone[] = layout.map((item) => {
      const zone = zones.find((zone) => zone.id === item.i);
      return {
        ...zone,
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
        minW: item.minW,
        minH: item.minH,
      };
    }) as Zone[];
    newFloors[selectedFloorIndex] = {
      ...newFloors[selectedFloorIndex],
      zones: transformZones,
    };

    set({ floors: newFloors });
  },

  saveZonesToDatabase: async (floorId: string) => {
    const ensureZoneId = (zone: any) => ({
      ...zone,
      id: zone.id ?? crypto.randomUUID(),
    });

    const { floors, selectedFloorIndex } = get();
    if (selectedFloorIndex === null) return;

    const floor = floors[selectedFloorIndex];
    if (!floor || floor.id !== floorId) return;

    const zones = floor.zones ?? [];

    try {
      const zonesWithId = zones.map(ensureZoneId);
      const keepIds = zonesWithId.map((z) => z.id);

      const zonesToSave = zonesWithId.map(({ zone_doctors, ...rest }) => ({
        ...rest,
        floor_id: floorId,
      }));

      const { error: upsertErr } = await supabase
        .from('zones')
        .upsert(zonesToSave, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;

      if (keepIds.length > 0) {
        const { error: cleanupErr } = await supabase
          .from('zones')
          .delete()
          .eq('floor_id', floorId)
          .not('id', 'in', `(${keepIds.join(',')})`);
        if (cleanupErr) throw cleanupErr;
      } else {
        const { error: wipeErr } = await supabase
          .from('zones')
          .delete()
          .eq('floor_id', floorId);
        if (wipeErr) throw wipeErr;
      }

      const allDoctorRows = zonesWithId.flatMap((zone) =>
        (zone.zone_doctors ?? []).map((d: any) => ({
          zone_id: zone.id,
          doctor_id: d.doctor_id,
        })),
      );

      if (keepIds.length > 0) {
        const { error: delLinksErr } = await supabase
          .from('zone_doctors')
          .delete()
          .in('zone_id', keepIds);
        if (delLinksErr) throw delLinksErr;
      }

      if (allDoctorRows.length > 0) {
        const { error: insLinksErr } = await supabase
          .from('zone_doctors')
          .insert(allDoctorRows);
        if (insLinksErr) throw insLinksErr;
      }

      toast('Зони успішно збережено!');
    } catch (error) {
      toast(
        `Помилка при збереженні зон: ${
          error instanceof Error ? error.message : 'Невідома помилка'
        }`,
      );
    }
  },


  loadZonesForFloor: async (floorId: string) => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select(
          `
              id, floor_id, type, x, y, width, height, color, subtitle, description, time_to, time_from, isOpen, isAdaptive,
              zone_doctors (
                doctor_id,
                doctors (id, full_name, specialty, email, phone)
              )
          `,
        )
        .eq('floor_id', floorId);
      if (error) console.error(error);

      const { floors } = get();
      const newFloors = floors.map((floor) =>
        floor.id === floorId ? { ...floor, zones: data } : floor,
      );
      set({ floors: newFloors as Floor[] });
    } catch (e) {
      console.error('Помилка при завантаженні зон:', e);
    }
  },

  removeZoneFromCurrentFloor: (id) => {
    const { floors, selectedFloorIndex } = get();
    if (selectedFloorIndex == null || !floors[selectedFloorIndex]) return;
    const f = floors[selectedFloorIndex];
    const next: Floor = { ...f, zones: f.zones.filter((z) => z.id !== id) };
    const newFloors = [...floors];
    newFloors[selectedFloorIndex] = next;
    set({
      floors: newFloors,
    });
  },
}));
