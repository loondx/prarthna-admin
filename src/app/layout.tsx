import React from 'react';
import './globals.css';
import AdminShell from '@/components/admin-shell';

export const metadata = {
  title: 'Prarthna Admin Dashboard',
  description:
    'Manage spiritual content, media processing, audio tracks, and habits for the Prarthna application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAF6F0]">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
