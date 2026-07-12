import React, { Suspense } from 'react';

export const metadata = {
  title: 'Sign In · Prarthna Admin',
  description: 'Prarthna Platform Administrator Login',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
