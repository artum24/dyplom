import {
  EMAIL_RX,
  isValidUaPhone,
  NAME_RX,
  SPECIALTY_RX,
} from '@/app/(app)/facility/[id]/doctors/components/helpers/constants';

export type DoctorForm = {
  full_name: string;
  specialty: string;
  phone: string;
  email: string;
};

export type DoctorErrors = Partial<Record<keyof DoctorForm, string>>;

export const validate = (v: DoctorForm): DoctorErrors => {
  const e: DoctorErrors = {};
  if (!v.full_name.trim()) e.full_name = 'Вкажіть ім’я лікаря';
  else if (!NAME_RX.test(v.full_name.trim()))
    e.full_name = 'Ім’я 2–60 символів (літери, пробіли, дефіс, апостроф).';

  if (v.specialty?.trim() && !SPECIALTY_RX.test(v.specialty.trim()))
    e.specialty = 'Спеціальність 2–60 символів (літери/цифри, пробіли, дефіс, апостроф).';

  if (v.phone?.trim() && !isValidUaPhone(v.phone))
    e.phone = 'Телефон має бути у форматі +380XXXXXXXXX';

  if (!!v.email.length && !EMAIL_RX.test(v.email.trim())) {
    e.email = 'Невірний формат електронної адреси';
  }

  return e;
};
