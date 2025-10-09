'use client';

import { useEffect, useState } from 'react';
import { listDoctors } from '@/lib/data/doctors';
import { useModal } from '@/store/modal/modal';
import { useMapBuilder } from '@/store/builder/builder';
import { Doctor, Zone, ZoneType } from '@/store/builder/types';
import { OptionType, Select } from '@/components/ui/Select/Select';
import SelectUI, { MultiValue } from 'react-select';
import { Calendar } from '@/components/ui/TimePicker/TimePicker';
import { Label } from '@/components/ui/Label/Label';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog/Dialog';
import { PRESETS } from '@/app/(app)/builder/[facilityId]/components/Palette/Palette';
import { toast } from 'sonner';

export const TYPE_OPTIONS: { value: ZoneType; label: string }[] = [
  { value: 'room', label: 'Кабінет' },
  { value: 'ward', label: 'Палата' },
  { value: 'operating', label: 'Операційна' },
  { value: 'diagnostics', label: 'Діагностика' },
  { value: 'isolation', label: 'Ізолятор' },
  { value: 'reception', label: 'Реєстратура' },
  { value: 'toilet', label: 'Санвузол' },
  { value: 'lift', label: 'Ліфт' },
  { value: 'stairs', label: 'Сходи' },
  { value: 'transition', label: 'Перехід' },
];

export const ZoneEditModal = ({ facilityId }: { facilityId: string }) => {
  const { isZoneEditOpen, zoneForEdit, closeZoneEdit } = useModal();
  const { updateZoneInCurrentFloor } = useMapBuilder();
  const [local, setLocal] = useState<Zone | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (zoneForEdit) {
          setLoading(true);
          const docs = await listDoctors(facilityId);
          setDoctors(docs);
          setSelectedDoctors((zoneForEdit?.zone_doctors || []).map((doctor) => doctor.doctor_id));
          setLocal(zoneForEdit);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [facilityId, zoneForEdit]);

  const isFreeZone = local?.type === 'toilet' || local?.type === 'exit' || local?.type === 'transition' || local?.type === 'lift' || local?.type === 'stairs' || local?.type === 'reception';

  const onSave = async () => {
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

      updateZoneInCurrentFloor({ ...local, color, subtitle, zone_doctors });
      closeZoneEdit();
      toast('Зона успішно збережена!');
    } catch (e) {
      console.error(e);
      toast('Помилка збереження');
    }
  };

  const doctorsOptions = doctors?.map((doctor) => ({
    value: doctor.id,
    label: doctor.full_name,
  })) as OptionType[];

  return (
    <Dialog
      open={isZoneEditOpen && !!zoneForEdit}
      onOpenChange={(value) => (!value ? closeZoneEdit() : null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редагування зони</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && <div className="text-sm text-gray-500">Завантаження…</div>}

          <div className="grid gap-2">
            <div className="grid gap-2">
              <Label>Тип</Label>
              <SelectUI
                value={TYPE_OPTIONS.find((value) => value.value === local?.type)}
                onChange={(e) => setLocal({ ...local!, type: e?.value as ZoneType })}
                options={TYPE_OPTIONS}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Назва / підзаголовок</Label>
            <Input
              className="w-full rounded border px-2 py-1.5 text-sm"
              value={local?.subtitle ?? ''}
              onChange={(e) => setLocal({ ...local!, subtitle: e.target.value })}
              placeholder="Напр., Кабінет педіатра"
            />
          </div>

          <div>
            <Label>Опис</Label>
            <textarea
              rows={3}
              className="w-full rounded border px-2 py-1.5 text-sm"
              value={local?.description ?? ''}
              onChange={(e) => setLocal({ ...local!, description: e.target.value })}
              placeholder="Додатково: обладнання, примітки…"
            />
          </div>

          {!isFreeZone && (
            <div className="grid gap-2">
              <Label>Лікарі</Label>
              <Select
                options={[...doctorsOptions]}
                values={selectedDoctors}
                onChange={(values: MultiValue<OptionType>) => {
                  setSelectedDoctors(values.map((value) => value.value));
                }}
              />
              <Calendar from={local?.time_from} to={local?.time_to} setValue={setLocal} />
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeZoneEdit} disabled={loading}>
              Скасувати
            </Button>
            <Button onClick={onSave} disabled={loading}>
              Зберегти
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
