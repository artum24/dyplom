import { Toaster } from '@/components/ui/Sonner/Sonner';
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClientForServer } from '@/lib/supabase.client';
import AppHeader from '@/components/AppHeader/AppHeader';

const RootLayout = async (props: { children: ReactNode }) => {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    redirect('/login');
  }
  return (
    <>
      <AppHeader />
      <div>{props.children}</div>
      <Toaster />
    </>
  );
};

export default RootLayout;
