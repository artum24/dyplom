'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader/AppHeader';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Мій заклад');
  const [err, setErr] = useState<string | null>(null);
  const r = useRouter();

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 text-xl font-semibold">Реєстрація</h1>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
              setErr(error.message);
              return;
            }
            if (data.user) r.replace('/dashboard');
          }}
        >
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full rounded bg-blue-600 py-2 text-white">Зареєструватися</button>
        </form>
      </main>
    </>
  );
}
