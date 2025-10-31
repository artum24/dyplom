import { useEffect } from 'react';
import { useModal } from '@/store/modal/modal';
import { OptionType } from '@/components/ui/Select/Select';

type UseDoctorsProps = {
  facilityId: string;
  setSelectedDoctors: (doctors: string[]) => void;
  setLocal: (local: any) => void;
  setIsAdaptive: (isAdaptive: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useDoctors = ({ facilityId, setSelectedDoctors, setLocal, setIsAdaptive, setIsOpen }: UseDoctorsProps) => {
  const { zoneForEdit, doctors } = useModal();

  useEffect(() => {
    if (zoneForEdit) {
      setSelectedDoctors((zoneForEdit?.zone_doctors || []).map((doctor) => doctor.doctor_id));
      setLocal(zoneForEdit);
      setIsAdaptive(!!zoneForEdit?.isAdaptive);
      setIsOpen(!!zoneForEdit?.isOpen);
    }
  }, [facilityId, zoneForEdit]);

  const doctorsOptions = doctors?.map((doctor) => ({
    value: doctor.id,
    label: doctor.full_name,
  })) as OptionType[];

  return { doctors, doctorsOptions };
};