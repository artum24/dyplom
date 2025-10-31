'use client';

import { useState } from 'react';
import { useModal } from '@/store/modal/modal';
import { Zone, ZoneType } from '@/store/builder/types';
import { OptionType, Select } from '@/components/ui/Select/Select';
import SelectUI, { MultiValue } from 'react-select';
import { Calendar } from '@/components/ui/TimePicker/TimePicker';
import { Label } from '@/components/ui/Label/Label';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog/Dialog';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { useSave } from '@/app/(app)/builder/[facilityId]/components/ZoneEditModal/useSave';
import { useDoctors } from '@/app/(app)/builder/[facilityId]/components/ZoneEditModal/useDoctors';

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
  { value: 'wall', label: 'Стіна' },
];

export const ZoneEditModal = ({ facilityId }: { facilityId: string }) => {
  const { isZoneEditOpen, zoneForEdit, closeZoneEdit, doctors } = useModal();
  const [local, setLocal] = useState<Zone | null>(null);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAdaptive, setIsAdaptive] = useState(false);

  const { doctorsOptions } = useDoctors({
    facilityId,
    setIsAdaptive,
    setIsOpen,
    setSelectedDoctors,
    setLocal,
  });

  const isFreeZone = local?.type === 'toilet' || local?.type === 'exit' || local?.type === 'transition' || local?.type === 'lift' || local?.type === 'stairs' || local?.type === 'reception' || local?.type === 'wall';
  const isPortal = local?.type === 'lift' || local?.type === 'stairs';

  const { onSave } = useSave({ selectedDoctors, isOpen, isPortal, isAdaptive, doctors, local });

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
          {isPortal && (
            <div className="grid gap-2">
              <div className="flex items-center gap-3">
                <Checkbox id="isOpen" checked={isOpen} onCheckedChange={(value) => setIsOpen(value as boolean)} />
                <Label htmlFor="terms">Відчинено</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox id="isAdaptive" checked={isAdaptive}
                          onCheckedChange={(value) => setIsAdaptive(value as boolean)} />
                <Label htmlFor="terms">Адаптовано для осіб з інвалідністю.</Label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeZoneEdit}>
              Скасувати
            </Button>
            <Button onClick={onSave}>
              Зберегти
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
