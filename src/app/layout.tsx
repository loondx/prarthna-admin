import React from 'react';
import './globals.css';
import AdminShell from '@/components/admin-shell';

export const metadata = {
  title: 'Prarthna Admin Dashboard',
  description:
    'Manage spiritual content, media processing, audio tracks, and habits for the Prarthna application.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕉️</text></svg>',
  },
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
