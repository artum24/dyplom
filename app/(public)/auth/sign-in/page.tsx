'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader/AppHeader';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const r = useRouter();
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-sm p-6">
        <h1 className="mb-4 text-xl font-semibold">Вхід</h1>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
              setErr(error.message);
              return;
            }
            r.replace('/dashboard');
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
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button className="w-full rounded bg-blue-600 py-2 text-white">Увійти</button>
        </form>
        <p className="mt-3 text-sm text-gray-600">
          Немає акаунта?{' '}
          <a className="underline" href="/auth/sign-up">
            Зареєструватися
          </a>
        </p>
      </main>
    </>
  );
}
