import { GeistSans } from 'geist/font/sans';
import { Toaster } from '@/components/ui/Sonner/Sonner';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider/SupabaseProvider';
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
    <html lang="en">
      <body className={GeistSans.variable}>
        <SupabaseProvider>
          <AppHeader />
          <div>{props.children}</div>
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
