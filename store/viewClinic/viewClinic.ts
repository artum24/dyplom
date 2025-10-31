import { create } from 'zustand';
import type { Doctor, Floor, Zone } from '../builder/types';

interface ViewClinicState {
  stateFacilityId: string | null;

  floors: Omit<Floor, 'zones'>[];
  selectedFloorId: string | null;

  zones: Zone[];
  selectedZoneId: string | null;

  doctors: Doctor[];

  floorsCorridor: Record<string, boolean[][]>;

  activePathZoneIds: string[];
  startZoneId: string | null;
  activePathByFloor: Record<string, { x: number; y: number }[]>;

  setDoctors: (doctors: Doctor[]) => void;
  setStateFacilityId: (id: string | null) => void;
  setFloors: (floors: Omit<Floor, 'zones'>[]) => void;
  setSelectedFloorId: (id: string | null) => void;
  setZones: (zones: Zone[]) => void;
  setSelectedZoneId: (id: string | null) => void;

  setActivePathZoneIds: (ids: string[]) => void;
  setStartZoneId: (id: string | null) => void;
  setActivePathByFloor: (m: Record<string, { x: number; y: number }[]>) => void;

  setFloorsCorridor: (floorsCorridor: Record<string, boolean[][]>) => void;
  reset: () => void;
}

export const useViewClinic = create<ViewClinicState>()((set) => ({
  stateFacilityId: null,
  doctors: [],
  floors: [],
  selectedFloorId: null,
  floorsCorridor: {},
  zones: [],
  selectedZoneId: null,

  activePathZoneIds: [],
  startZoneId: null,
  activePathByFloor: {},

  setStateFacilityId: (id) => set({ stateFacilityId: id }),
  setDoctors: (doctors) => set({ doctors }),
  setFloors: (floors) => set({ floors }),
  setSelectedFloorId: (id) => set({ selectedFloorId: id }),
  setZones: (zones) => set({ zones }),
  setSelectedZoneId: (id) => set({ selectedZoneId: id }),

  setActivePathZoneIds: (ids) => set({ activePathZoneIds: ids }),
  setStartZoneId: (id) => set({ startZoneId: id }),
  setActivePathByFloor: (m) => set({ activePathByFloor: m }),
  setFloorsCorridor: (floorsCorridor) => set({ floorsCorridor }),

  reset: () => set({
    stateFacilityId: null,
    doctors: [],
    floors: [],
    selectedFloorId: null,
    floorsCorridor: {},
    zones: [],
    selectedZoneId: null,

    activePathZoneIds: [],
    startZoneId: null,
    activePathByFloor: {},
  }),
}));