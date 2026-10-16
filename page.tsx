import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { WS } from '@/lib/workspaces';

/** All workspace screens are client-rendered from the shared store; the URL picks the screen. */
export default async function WorkspacePage({ params }: { params: Promise<{ ws: string; slug?: string[] }> }) {
  const { ws, slug } = await params;
  if (!(ws in WS) || (slug && slug.length > 2)) notFound();
  return <Suspense><AppShell /></Suspense>;
}
