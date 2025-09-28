import { create } from 'zustand';
import { Zone } from '../builder/types';

interface ModalState {
  isZoneEditOpen: boolean;
  zoneForEdit: Zone | null;
  openZoneEdit: (zone: Zone) => void;
  closeZoneEdit: () => void;
}

export const useModal = create<ModalState>((set) => ({
  isZoneEditOpen: false,
  zoneForEdit: null,
  openZoneEdit: (zone) => set({ isZoneEditOpen: true, zoneForEdit: zone }),
  closeZoneEdit: () => set({ isZoneEditOpen: false, zoneForEdit: null }),
}));
