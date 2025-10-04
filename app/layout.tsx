import './globals.css';

import { GeistSans } from 'geist/font/sans';
import { Toaster } from '@/components/ui/Sonner/Sonner';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider/SupabaseProvider';
import { ReactNode } from 'react';

let title = 'Medmap';

export const metadata = {
  title,
  metadataBase: new URL('https://nextjs-postgres-auth.vercel.app'),
};

const RootLayout = (props: { children: ReactNode }) => {
  return (
    <html lang="en">
    <body className={GeistSans.variable}>
    <SupabaseProvider>{props.children}</SupabaseProvider>
    <Toaster />
    </body>
    </html>
  );
};

export default RootLayout;
