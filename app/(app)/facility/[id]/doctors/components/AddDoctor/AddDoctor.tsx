'use client';

import { useMemo, useState } from 'react';
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
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createDoctor, listDoctors } from '@/lib/data/doctors';
import { Doctor } from '@/store/builder/types';
import {
  DoctorErrors,
  DoctorForm,
  validate,
} from '@/app/(app)/facility/[id]/doctors/components/helpers/validation';

type DoctorTouched = Partial<Record<keyof DoctorForm, boolean>>;

const normalizePhone = (raw: string) => raw.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, ''); // лише перший плюс

export const AddDoctorDialog = ({
  facilityId,
  updateDoctors,
}: {
  facilityId: string;
  updateDoctors: (doctor: Doctor[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState<DoctorForm>({
    full_name: '',
    specialty: '',
    phone: '',
    email: '',
  });

  const [touched, setTouched] = useState<DoctorTouched>({});
  const [errors, setErrors] = useState<DoctorErrors>({});

  const currentErrors = useMemo(() => validate(form), [form]);
  const isValid = useMemo(() => Object.keys(currentErrors).length === 0, [currentErrors]);

  const setField =
    <K extends keyof DoctorForm>(key: K) =>
    (val: string) => {
      setForm((s) => ({ ...s, [key]: val }));
    };

  const handleBlur = (key: keyof DoctorForm) => () => setTouched((t) => ({ ...t, [key]: true }));

  const showError = (key: keyof DoctorForm) => touched[key] && currentErrors[key];

  const resetForm = () => {
    setForm({ full_name: '', specialty: '', phone: '', email: '' });
    setTouched({});
    setErrors({});
  };

  const onSubmit = async () => {
    setTouched({ full_name: true, specialty: true, phone: true, email: true });
    setErrors(currentErrors);

    if (!isValid) return;

    try {
      setIsLoading(true);

      const payload = {
        facility_id: facilityId,
        full_name: form.full_name,
        specialty: form.specialty,
        phone: normalizePhone(form.phone),
        email: form.email.trim(),
      };
      await createDoctor(payload);
      listDoctors(facilityId).then(updateDoctors);
      setIsOpen(false);
      resetForm();
      toast.success('Лікаря успішно додано!');
    } catch (err) {
      console.error(err);
      toast.error('Сталася помилка при збереженні лікаря');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger onClick={() => setIsOpen(true)}>
        <Button>
          <Plus />
          Додайте нового лікаря
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додати нового лікаря</DialogTitle>
          <DialogDescription>Додайте інформацію про нового лікаря</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="doctor-name">Ім&apos;я</Label>
            <Input
              id="doctor-name"
              name="full_name"
              value={form.full_name}
              onChange={(e) => setField('full_name')(e.target.value)}
              onBlur={handleBlur('full_name')}
              placeholder="Ім'я та прізвище"
              aria-invalid={!!showError('full_name')}
              aria-describedby="doctor-full_name-error"
            />
            {showError('full_name') && (
              <p id="doctor-name-error" className="text-sm text-red-500">
                {currentErrors.full_name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="doctor-specialty">Спеціальність</Label>
            <Input
              id="doctor-specialty"
              name="specialty"
              value={form.specialty}
              onChange={(e) => setField('specialty')(e.target.value)}
              onBlur={handleBlur('specialty')}
              placeholder="Напр.: Кардіолог"
              aria-invalid={!!showError('specialty')}
              aria-describedby="doctor-specialty-error"
            />
            {showError('specialty') && (
              <p id="doctor-specialty-error" className="text-sm text-red-500">
                {currentErrors.specialty}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="doctor-phone">Телефон</Label>
            <Input
              id="doctor-phone"
              name="phone"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setField('phone')(e.target.value)}
              onBlur={handleBlur('phone')}
              placeholder="+380XXXXXXXXX"
              aria-invalid={!!showError('phone')}
              aria-describedby="doctor-phone-error"
            />
            {showError('phone') && (
              <p id="doctor-phone-error" className="text-sm text-red-500">
                {currentErrors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="doctor-email">Електронна адреса</Label>
            <Input
              id="doctor-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email')(e.target.value)}
              onBlur={handleBlur('email')}
              placeholder="name@example.com"
              aria-invalid={!!showError('email')}
              aria-describedby="doctor-email-error"
            />
            {showError('email') && (
              <p id="doctor-email-error" className="text-sm text-red-500">
                {currentErrors.email}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Відмінити
          </Button>
          <Button
            loading={isLoading}
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
