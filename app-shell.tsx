'use client';

import { useEffect, type ReactNode } from 'react';
import { SCREENS } from '@/features/registry';
import { PlatformArchitecture } from '@/features/platform/platform';
import { HOME, ROLES, WS } from '@/lib/workspaces';
import { Modals } from './modals';
import { useLoc, usePlatform } from './platform-provider';
import { MobileNav, Sidebar, Toasts, TopBar } from './shell';

/** Client app shell: top bar, sidebar and the screen for the current URL. */
export function AppShell() {
  const { role, go } = usePlatform();
  const loc = useLoc();
  const allowed = ROLES[role].ws.includes(loc.ws);

  useEffect(() => { window.scrollTo(0, 0); }, [loc.ws, loc.route, loc.param]);

  let body: ReactNode;
  if (!allowed) {
    const first = ROLES[role].ws[0];
    body = (
      <div className="card"><div className="empty">
        <p>{ROLES[role].n} doesn’t have access to {WS[loc.ws].name}.</p>
        <button className="btn primary" onClick={() => go(first, HOME[first])}>Go to {WS[first].name}</button>
      </div></div>
    );
  } else if (loc.route === 'platform') {
    body = <PlatformArchitecture />;
  } else {
    const Screen = SCREENS[loc.ws][loc.route];
    body = Screen
      ? <Screen param={loc.param} tab={loc.tab} />
      : <div className="card"><div className="empty">This page doesn’t exist. <button className="btn sm" onClick={() => go(loc.ws, HOME[loc.ws])}>Back to overview</button></div></div>;
  }

  return (
    <>
      <TopBar />
      <MobileNav />
      <div className="shell">
        <Sidebar />
        <main className="main"><div className="page">{body}</div></main>
      </div>
      <Modals />
      <Toasts />
    </>
  );
}
