import { create } from 'zustand';
import { Doctor, Zone } from '../builder/types';

interface ModalState {
  isZoneEditOpen: boolean;
  zoneForEdit: Zone | null;
  openZoneEdit: (zone: Zone) => void;
  closeZoneEdit: () => void;
  doctors: Doctor[];
  setDoctors: (doctors: Doctor[]) => void;
}

export const useModal = create<ModalState>((set) => ({
  isZoneEditOpen: false,
  zoneForEdit: null,
  doctors: [],
  openZoneEdit: (zone) => set({ isZoneEditOpen: true, zoneForEdit: zone }),
  closeZoneEdit: () => set({ isZoneEditOpen: false, zoneForEdit: null }),
  setDoctors: (doctors) => set({ doctors }),
}));
