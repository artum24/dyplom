import Link from 'next/link';
import { supabaseServer } from '@/lib/supabaseServer';
import AppHeader from '@/components/AppHeader/AppHeader';
import AuthGate from '@/components/AuthGate/AuthGate';

export default async function Dashboard() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const { data: facilities } = await sb
    .from('facilities')
    .select('*')
    .eq('owner', user!.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <AppHeader />
      <AuthGate>
        <main className="mx-auto max-w-5xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Мої заклади</h1>
            <form action={createFacilityAction}>
              <button className="rounded bg-blue-600 px-3 py-1.5 text-white">+ Новий заклад</button>
            </form>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {facilities?.map((f) => (
              <div key={f.id} className="rounded border bg-white p-4 shadow-sm">
                <div className="font-medium">{f.name}</div>
                <div className="mt-2 flex gap-2 text-sm">
                  <Link className="underline" href={`/builder/${f.id}`}>
                    Відкрити редактор
                  </Link>
                  <Link className="underline" href={`/facility/${f.id}/doctors`}>
                    Лікарі
                  </Link>
                  <Link className="underline" href={`/kiosk/${f.id}`}>
                    Кіоск
                  </Link>
                </div>
              </div>
            ))}
            {!facilities?.length && (
              <div className="text-gray-600">Поки порожньо. Створи перший заклад.</div>
            )}
          </div>
        </main>
      </AuthGate>
    </>
  );
}

async function createFacilityAction() {
  'use server';
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  console.log('user', user);
  if (!user) return;
  await sb.from('facilities').insert({ name: 'Новий заклад', owner: user.id });
}
