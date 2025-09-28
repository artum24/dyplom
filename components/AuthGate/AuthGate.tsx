import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function AuthGate({ children }: { children: ReactNode }) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect('/auth/sign-in');
  return <>{children}</>;
}
