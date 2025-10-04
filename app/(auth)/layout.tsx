'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const CompanyLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isSignUp = pathname.includes('sign-up');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br bg-white p-0 sm:p-4">
      <div className={`w-full ${isSignUp ? 'max-w-xl' : 'max-w-md'} rounded-2xl sm:p-4`}>
        <div className="py-6 px-4 md:py-12 h-full">{children}</div>
      </div>
    </div>
  );
};

export default CompanyLayout;
