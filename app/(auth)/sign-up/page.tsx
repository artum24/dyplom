import Link from 'next/link';

import type { Metadata } from 'next';
import SignUpForm from '@/components/auth/sign-up/SignUpForm';

export const metadata: Metadata = {
  title: 'Реєстрація облікового запису',
  description: 'Реєстрація облікового запису',
};

export default function SignUpPage() {
  return (
    <div className="text-start flex flex-col gap-5">
      <h1 className="text-3xl font-bold text-gray-800">Реєстрація</h1>
      <SignUpForm />
      <p className="text-gray-500">
        Уже маєте акаунт?
        <Link className="text-blue-700 underline mt-2" href="/login">
          Увійти
        </Link>
      </p>
    </div>
  );
}
