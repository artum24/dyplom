'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase.clients';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClientState] = useState(() => createClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClientState}>{children}</SessionContextProvider>
  );
}
