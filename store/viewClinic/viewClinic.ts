import { create } from 'zustand';
import type { Doctor, Floor, Zone } from '../builder/types';

interface ViewClinicState {
  stateFacilityId: string | null;

  floors: Omit<Floor, 'zones'>[];
  selectedFloorId: string | null;

  zones: Zone[];
  selectedZoneId: string | null;

  doctors: Doctor[];

  setDoctors: (doctors: Doctor[]) => void;

  setStateFacilityId: (id: string | null) => void;
  setFloors: (floors: Omit<Floor, 'zones'>[]) => void;
  setSelectedFloorId: (id: string | null) => void;

  setZones: (zones: Zone[]) => void;
  setSelectedZoneId: (id: string | null) => void;
}

export const useViewClinic = create<ViewClinicState>()((set, get) => ({
  stateFacilityId: null,
  doctors: [],
  floors: [],
  selectedFloorId: null,

  zones: [],
  selectedZoneId: null,

  setStateFacilityId: (id: string | null) => set({ stateFacilityId: id }),
  setDoctors: (doctors: Doctor[]) => set({ doctors }),
  setFloors: (floors: Omit<Floor, 'zones'>[]) => {
    set({
      floors,
    });
  },

  setSelectedFloorId: (id: string | null) => set({ selectedFloorId: id }),

  setZones: (zones: Zone[]) => set({ zones }),

  setSelectedZoneId: (id: string | null) => set({ selectedZoneId: id }),
}));
