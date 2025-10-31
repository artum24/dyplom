import { Doctor } from '@/store/builder/types';
import { PRESETS } from '@/app/(app)/builder/[facilityId]/components/Palette/Palette';
import { useMapBuilder } from '@/store/builder/builder';
import { useModal } from '@/store/modal/modal';

type UseSaveProps = {
  selectedDoctors: string[];
  doctors: Doctor[];
  isPortal: boolean;
  isOpen: boolean;
  isAdaptive: boolean;
  local: any;
};

export const useSave = ({ selectedDoctors, doctors, isPortal, isOpen, isAdaptive, local }: UseSaveProps) => {
  const { updateZoneInCurrentFloor } = useMapBuilder();
  const { closeZoneEdit } = useModal();

  const onSave = () => {
    if (!local) return;
    try {
      const zone_doctors = selectedDoctors.map((doctor_id) => ({
        doctor_id,
        doctors: doctors.find((doctor) => doctor.id === doctor_id),
      })) as {
        doctor_id: string;
        doctors: Doctor;
      }[];
      const presetItem = PRESETS.find((item) => item.type === local.type);
      const color = presetItem?.color as string;
      const subtitle = presetItem?.label as string;
      updateZoneInCurrentFloor({
        ...local,
        color,
        subtitle,
        zone_doctors,
        isOpen: isPortal ? isOpen : true,
        isAdaptive: isPortal ? isAdaptive : true,
      });
      closeZoneEdit();
    } catch (e) {
      console.error(e);
    }
  };

  return { onSave };
};