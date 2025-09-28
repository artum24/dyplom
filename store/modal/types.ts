import { Zone } from '../mapBuilder/types';

export interface ModalState {
  isEditModalOpen?: boolean;
  editZoneState?: Zone | null;
  isAddZoneDialog?: boolean;
  addZoneState?: Partial<Zone> | null;
  isDeleteZoneModalOpen?: boolean;
  deleteZoneState?: Zone | null;
}
