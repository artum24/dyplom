'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AppHeader() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="font-semibold">
          MedMap
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {email && (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-black">
                Dashboard
              </Link>
              <Link href="/kiosk-demo" className="text-gray-700 hover:text-black">
                Kiosk
              </Link>
            </>
          )}
        </nav>
        <div className="ml-auto">
          {email ? (
            <button
              className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={() => supabase.auth.signOut()}
            >
              Вийти ({email})
            </button>
          ) : (
            <Link
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              href="/auth/sign-in"
            >
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
