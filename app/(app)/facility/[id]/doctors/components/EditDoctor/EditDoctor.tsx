'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Label } from '@/components/ui/Label/Label';
import { Input } from '@/components/ui/Input/Input';
import { toast } from 'sonner';
import { Doctor } from '@/store/builder/types';
import { normalizePhone } from '@/app/(app)/facility/[id]/doctors/components/helpers/constants';
import { DoctorForm, validate } from '@/app/(app)/facility/[id]/doctors/components/helpers/validation';
import { supabase } from '@/lib/supabase';

type DoctorTouched = Partial<Record<keyof DoctorForm, boolean>>;

export function EditDoctorDialog({
                                   facilityId,
                                   doctor,
                                   doctors,
                                   onSuccess,
                                 }: {
  facilityId: string;
  doctor: Doctor;
  doctors: Doctor[];
  onSuccess: (updated: Doctor[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState<DoctorForm>({
    full_name: doctor.full_name || '',
    specialty: doctor.specialty || '',
    phone: doctor.phone || '',
    email: doctor.email || '',
  });
  const [touched, setTouched] = useState<DoctorTouched>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setForm({
      full_name: doctor.full_name || '',
      specialty: doctor.specialty || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
    });
    setTouched({});
  }, [doctor]);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const changed = useMemo(() => {
    return (
      (doctor.full_name || '') !== form.full_name ||
      (doctor.specialty || '') !== form.specialty ||
      (doctor.phone || '') !== form.phone ||
      (doctor.email || '') !== form.email
    );
  }, [doctor, form]);

  const setField =
    <K extends keyof DoctorForm>(k: K) =>
      (val: string) =>
        setForm((s) => ({ ...s, [k]: val }));

  const handleBlur = (k: keyof DoctorForm) => () => setTouched((t) => ({ ...t, [k]: true }));

  const showError = (k: keyof DoctorForm) => touched[k] && errors[k];

  const onSubmit = async () => {
    setTouched({ full_name: true, specialty: true, phone: true, email: true });
    if (!isValid || !changed) return;

    try {
      setIsLoading(true);
      const payload: Partial<Doctor> = {
        id: doctor.id,
        facility_id: facilityId,
        full_name: form.full_name.trim(),
        specialty: form.specialty.trim(),
        phone: form.phone ? normalizePhone(form.phone) : '',
        email: form.email ? form.email.trim().toLowerCase() : '',
      };
      await supabase
        .from('doctors')
        .update({ ...payload })
        .eq('id', doctor.id);

      toast.success('Дані лікаря оновлено');
      onSuccess(
        doctors.map((d) => {
          if (d.id === doctor.id) {
            return { ...d, ...payload };
          }
          return d;
        }),
      );
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Не вдалося оновити лікаря');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogTrigger>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Редагувати
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редагувати лікаря</DialogTitle>
          <DialogDescription>Оновіть інформацію про лікаря</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Ім&apos;я</Label>
            <Input
              id="edit-name"
              value={form.full_name}
              onChange={(e) => setField('full_name')(e.target.value)}
              onBlur={handleBlur('full_name')}
              aria-invalid={!!showError('full_name')}
              aria-describedby="edit-name-err"
              placeholder="Ім'я та прізвище"
            />
            {showError('full_name') && (
              <p id="edit-name-err" className="text-sm text-red-500">
                {errors.full_name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-spec">Спеціальність</Label>
            <Input
              id="edit-spec"
              value={form.specialty}
              onChange={(e) => setField('specialty')(e.target.value)}
              onBlur={handleBlur('specialty')}
              aria-invalid={!!showError('specialty')}
              aria-describedby="edit-spec-err"
              placeholder="Напр.: Кардіолог"
            />
            {showError('specialty') && (
              <p id="edit-spec-err" className="text-sm text-red-500">
                {errors.specialty}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-phone">Телефон</Label>
            <Input
              id="edit-phone"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setField('phone')(e.target.value)}
              onBlur={handleBlur('phone')}
              aria-invalid={!!showError('phone')}
              aria-describedby="edit-phone-err"
              placeholder="+380XXXXXXXXX"
            />
            {showError('phone') && (
              <p id="edit-phone-err" className="text-sm text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-email">Електронна адреса</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email')(e.target.value)}
              onBlur={handleBlur('email')}
              aria-invalid={!!showError('email')}
              aria-describedby="edit-email-err"
              placeholder="name@example.com"
            />
            {showError('email') && (
              <p id="edit-email-err" className="text-sm text-red-500">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Відмінити
          </Button>
          <Button
            type="button"
            loading={isLoading}
            disabled={!isValid || !changed || isLoading}
            onClick={onSubmit}
          >
            {isLoading ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
