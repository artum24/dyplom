import { create } from 'zustand';
import type { Doctor, Floor, Zone } from '../builder/types';


export type ViewConnection = { from_zone_id: string; to_zone_id: string; weight?: number };


interface ViewClinicState {
  stateFacilityId: string | null;


  floors: Omit<Floor, 'zones'>[];
  selectedFloorId: string | null;


  zones: Zone[];
  selectedZoneId: string | null;


  doctors: Doctor[];

  activePathZoneIds: string[];
  startZoneId: string | null;

  setDoctors: (doctors: Doctor[]) => void;
  setStateFacilityId: (id: string | null) => void;
  setFloors: (floors: Omit<Floor, 'zones'>[]) => void;
  setSelectedFloorId: (id: string | null) => void;
  setZones: (zones: Zone[]) => void;
  setSelectedZoneId: (id: string | null) => void;

  setActivePathZoneIds: (ids: string[]) => void;
  setStartZoneId: (id: string | null) => void;
}


export const useViewClinic = create<ViewClinicState>()((set) => ({
  stateFacilityId: null,
  doctors: [],
  floors: [],
  selectedFloorId: null,


  zones: [],
  selectedZoneId: null,

  activePathZoneIds: [],
  startZoneId: null,


  setStateFacilityId: (id) => set({ stateFacilityId: id }),
  setDoctors: (doctors) => set({ doctors }),
  setFloors: (floors) => set({ floors }),
  setSelectedFloorId: (id) => set({ selectedFloorId: id }),
  setZones: (zones) => set({ zones }),
  setSelectedZoneId: (id) => set({ selectedZoneId: id }),


  setActivePathZoneIds: (ids) => set({ activePathZoneIds: ids }),
  setStartZoneId: (id) => set({ startZoneId: id }),
}));