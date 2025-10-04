import Link from 'next/link';

import type { Metadata } from 'next';
import LoginForm from '@/components/auth/login/LoginForm';

export const metadata: Metadata = {
  title: 'Авторизація',
  description:
    'Вхід в особистий кабінет сервісу Remo CRM: є можливість авторизації через Google або за електронною поштою.',
};

export default function LoginPage() {
  return (
    <div className="text-start flex flex-col gap-5">
      <h1 className="text-3xl font-bold text-gray-800">Увійти</h1>
      <p className="text-gray-500 text-sm">
        Огляд клієнтів, їхніх автомобілів, контактної інформації та статусів обслуговування.
      </p>
      <LoginForm />
      <p className="text-gray-500">
        Не маєте облікового запису?
        <Link className="underline text-blue-800" href="/sign-up">
          Зареєструватись
        </Link>
      </p>
    </div>
  );
}
