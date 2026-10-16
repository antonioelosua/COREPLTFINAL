import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { cookies } from 'next/headers';
import { PlatformProvider } from '@/components/platform-provider';
import { getSnapshot } from '@/lib/server/repo';
import { isRole } from '@/lib/workspaces';
import './globals.css';


export const metadata: Metadata = {
  title: 'Beecker Platform',
  description: 'One Beecker Platform. Multiple role-specific workspaces over a shared Understand → Build → Run architecture.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Mock auth: role comes from a cookie set by the role switcher. Replace with the SSO session.
  const roleCookie = (await cookies()).get('bp_role')?.value;
  const role = isRole(roleCookie) ? roleCookie : 'admin';
  const db = getSnapshot();
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <PlatformProvider initialDb={db} initialRole={role}>{children}</PlatformProvider>
      </body>
    </html>
  );
}
