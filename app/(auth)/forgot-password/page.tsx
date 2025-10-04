import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/forgot-password/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Відновлення пароля',
  description:
    'Швидке та безпечне відновлення доступ до облікового запису: введіть адресу електронної пошти, щоб отримати інструкції для скидання пароля.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-bold text-gray-800">Забули пароль?</h1>
      <p className="text-gray-500 text-sm">
        Не хвилюйтеся, ми надішлемо вам інструкції для скидання паролю.
      </p>

      <ForgotPasswordForm />

      <div className="flex items-center gap-2 text-gray-600">
        <ArrowLeft size={16} />
        <Link href="/login" className="text-sm  hover:underline">
          Назад до авторизації
        </Link>
      </div>
    </div>
  );
}
