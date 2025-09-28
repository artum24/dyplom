import Link from 'next/link';
import AppHeader from '@/components/AppHeader/AppHeader';

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">MedMap — конструктор планів медзакладів</h1>
        <p className="mt-2 text-gray-600">
          Створи поверхи, розстав кабінети, додай лікарів і покажи ізометричну карту на екрані
          закладу.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/auth/sign-up" className="rounded bg-blue-600 px-4 py-2 text-white">
            Почати
          </Link>
          <Link href="/auth/sign-in" className="rounded border px-4 py-2">
            У мене вже є акаунт
          </Link>
        </div>
      </main>
    </>
  );
}
