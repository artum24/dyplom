'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase.clients';
import { PageLoader } from '@/components/PageLoader/PageLoader';

export function CallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const userCheck = async () => {
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user) {
      router.replace('/');
    } else {
      router.replace('/login');
    }
  };

  useEffect(() => {
    userCheck();
  }, []);

  return <PageLoader />;
}
