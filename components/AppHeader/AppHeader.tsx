'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase.clients';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';

export default function AppHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onLogout = async () => {
    const supabaseClient = createClient();
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="border-b flex justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold">
          MedMap
        </Link>
        <nav className="flex items-center gap-3 text-sm justify-between">
          {email && (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-black">
                Заклади
              </Link>
            </>
          )}
        </nav>
      </div>
      <div>
        {email ? (
          <Button onClick={onLogout}>Вийти ({email})</Button>
        ) : (
          <Link
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            href="/login"
          >
            Увійти
          </Link>
        )}
      </div>
    </header>
  );
}
