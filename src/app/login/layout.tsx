import React, { Suspense } from 'react';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Sign In · Prarthna Admin',
  description: 'Prarthna Platform Administrator Login',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense>
        {children}
      </Suspense>
    </AuthProvider>
  );
}
