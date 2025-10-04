import { createClientForServer } from '@/lib/supabase.client';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }
  return <></>;
}
