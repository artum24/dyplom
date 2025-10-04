import type { Metadata } from 'next';
import UpdatePasswordForm from '@/components/auth/update-password/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Оновлення паролю',
  description:
    'Зміна пароля для відновлення доступу. Введіть та підтвердьте новий пароль, щоб успішно оновити акаунт.',
};

export default function UpdatePasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">Зміна пароля</h1>
      <p className="mb-6 text-center text-gray-500 text-sm">
        Введіть новий пароль для завершення процесу відновлення доступу.
      </p>

      <UpdatePasswordForm />
    </>
  );
}
