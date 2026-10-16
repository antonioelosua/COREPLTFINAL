'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { HOME, ROLES, WS, WS_IDS, isNavActive, navFor } from '@/lib/workspaces';
import type { RoleId, WorkspaceId } from '@/lib/types';
import { useLoc, useLookup, usePlatform } from './platform-provider';

/** Default tab for tabbed screens, so the sidebar highlights correctly before a tab is chosen. */
export const DEFAULT_TAB: Record<string, string> = { catalog: 'systems', buildcat: 'workflows', deploy: 'envs', health: 'runs', perf: 'evals', rel: 'versions' };

export function WsIcon({ ws, size = 28 }: { ws: WorkspaceId; size?: number }) {
  const w = WS[ws];
  return <span className="ws-ico" style={{ background: w.bg, color: w.fg, width: size, height: size }}>{w.ico}</span>;
}

function Dropdown({ id, open, setOpen, button, children, menuClass = '', menuStyle }: {
  id: string; open: string | null; setOpen: (v: string | null) => void; button: ReactNode; children: ReactNode; menuClass?: string; menuStyle?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open !== id) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open, id, setOpen]);
  return (
    <div className="dd" ref={ref}>
      <span onClick={() => setOpen(open === id ? null : id)}>{button}</span>
      {open === id && <div className={`dd-menu ${menuClass}`} style={menuStyle} onClick={() => setOpen(null)}>{children}</div>}
    </div>
  );
}

const Caret = () => <span className="caret" />;

export function TopBar() {
  const { role, setRole, env, setEnv, go, canOpen, setFilter, toast, db } = usePlatform();
  const loc = useLoc();
  const [open, setOpen] = useState<string | null>(null);
  const w = WS[loc.ws], r = ROLES[role];
  const custLabel = loc.ws === 'ops' ? 'All customers' : loc.ws === 'finn' ? 'Beecker Sales' : 'Grupo Lala';
  const envDot = env === 'UAT' ? 'uat' : env === 'Development' ? 'dev' : '';

  return (
    <header className="top">
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/beecker-wordmark.png" alt="Beecker" style={{ height: 24, width: 'auto', display: 'block' }} />
      </div>

      <Dropdown id="ws" open={open} setOpen={setOpen} menuStyle={{ minWidth: 330 }}
        button={<button className="dd-btn" aria-label="Switch workspace"><WsIcon ws={loc.ws} size={20} /><b>{w.name}</b><Caret /></button>}>
        <div className="dd-head">One platform · choose a workspace</div>
        {WS_IDS.map(k => {
          const ok = canOpen(k);
          return (
            <button key={k} className={`dd-item ${k === loc.ws ? 'on' : ''}`} disabled={!ok} onClick={() => go(k, HOME[k])}>
              <WsIcon ws={k} />
              <span><span className="t">{WS[k].name}</span><br /><span className="d">{ok ? WS[k].desc : 'Not available for ' + r.n}</span></span>
            </button>
          );
        })}
        <div className="hr" style={{ margin: '6px 0' }} />
        <button className="dd-item" onClick={() => go(loc.ws, 'platform')}>
          <span className="ws-ico" style={{ background: 'var(--surface-3)', color: 'var(--fg-2)' }}>⌗</span>
          <span><span className="t">Platform architecture</span><br /><span className="d">Understand → Build → Run, shared by every workspace</span></span>
        </button>
      </Dropdown>

      <div className="hide-sm">
        <Dropdown id="cust" open={open} setOpen={setOpen} menuStyle={{ minWidth: 240 }}
          button={<button className="dd-btn"><span className="lbl">Customer</span><b>{custLabel}</b><Caret /></button>}>
          <div className="dd-head">Customer scope</div>
          {loc.ws === 'ops' ? (
            <>
              <button className="dd-item on" onClick={() => setFilter('cust', 'all')}><span className="t">All customers</span></button>
              {db.customers.map(c => (
                <button key={c.id} className="dd-item" onClick={() => { setFilter('cust', c.id); go('ops', 'fleet'); }}><span className="t">{c.name}</span></button>
              ))}
            </>
          ) : loc.ws === 'finn' ? (
            <div className="note" style={{ margin: 4 }}>FINN works across every account assigned to the AE.</div>
          ) : (
            <>
              <button className="dd-item on"><span className="t">Grupo Lala</span></button>
              {role === 'admin' || role === 'fde'
                ? db.customers.slice(1).map(c => (
                  <button key={c.id} className="dd-item" onClick={() => toast(role === 'fde' ? `${c.name} is not assigned to you.` : `${c.name} delivery workspace is not part of the mock data. Grupo Lala is fully modeled.`)}>
                    <span className="t">{c.name}</span><span className="d" style={{ marginLeft: 'auto' }}>{role === 'fde' ? 'not assigned' : ''}</span>
                  </button>))
                : <div className="note" style={{ margin: 4 }}>Customer users only see their own company.</div>}
            </>
          )}
        </Dropdown>
      </div>

      <div className="top-right">
        <div className="search hide-sm">
          <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="5.5" cy="5.5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8.8 8.8 12 12" stroke="currentColor" strokeWidth="1.4" /></svg>
          Search agents, entities, runs<kbd>⌘K</kbd>
        </div>
        <button className={`arch-btn hide-sm ${loc.route === 'platform' ? 'on' : ''}`} onClick={() => go(loc.ws, 'platform')}>Platform</button>
        <div className="hide-sm">
          <Dropdown id="env" open={open} setOpen={setOpen} menuClass="right" menuStyle={{ minWidth: 200 }}
            button={<button className="dd-btn"><span className={`env-dot ${envDot}`} /><b>{env}</b><Caret /></button>}>
            {['Production', 'UAT', 'Development'].map(e => (
              <button key={e} className={`dd-item ${e === env ? 'on' : ''}`} onClick={() => { setEnv(e); if (loc.ws === 'ops') setFilter('env', e === 'Development' ? 'all' : e); toast(`Environment: ${e}`); }}>
                <span className={`env-dot ${e === 'UAT' ? 'uat' : e === 'Development' ? 'dev' : ''}`} style={{ marginTop: 5 }} /><span className="t">{e}</span>
              </button>
            ))}
          </Dropdown>
        </div>
        <Dropdown id="role" open={open} setOpen={setOpen} menuClass="right" menuStyle={{ minWidth: 320 }}
          button={<button className="dd-btn" style={{ paddingLeft: 4 }}><span className="avatar">{r.i}</span><span className="lbl">As</span><b>{r.n}</b><Caret /></button>}>
          <div className="dd-head">Preview as role</div>
          {(Object.keys(ROLES) as RoleId[]).map(k => (
            <button key={k} className={`dd-item ${k === role ? 'on' : ''}`} onClick={() => {
              setRole(k);
              const allowed = ROLES[k].ws;
              if (!allowed.includes(loc.ws)) go(allowed[0], HOME[allowed[0]]);
              else if (k === 'cexec' && loc.route === 'approvals') go('cust', 'home');
            }}>
              <span className="avatar">{ROLES[k].i}</span>
              <span><span className="t">{ROLES[k].n}</span> <span className="faint">· {ROLES[k].who}</span><br /><span className="d">{ROLES[k].d}</span></span>
            </button>
          ))}
        </Dropdown>
      </div>
    </header>
  );
}

function NavItems({ mobile }: { mobile?: boolean }) {
  const { db, role, go } = usePlatform();
  const loc = useLoc();
  const tab = loc.tab ?? DEFAULT_TAB[loc.route] ?? null;
  return (
    <>
      {navFor(loc.ws, db, role).map((g, gi) => (
        <div className="nav-group" key={gi}>
          {g.h && !mobile && <div className="nav-h">{g.h}{g.lt && <span className={`lt ${g.lt}`}>{{ u: 'U', b: 'B', r: 'R' }[g.lt]}</span>}</div>}
          {g.items.map(it => (
            <button key={it.l + (it.t ?? '')} className={`nav-i ${isNavActive(it, loc.ws, loc.route, tab) ? 'on' : ''}`} onClick={() => go(loc.ws, it.r, it.p, it.t)}>
              {it.l}{it.badge && <span className={`badge ${it.badge[1]}`}>{it.badge[0]}</span>}
            </button>
          ))}
        </div>
      ))}
    </>
  );
}

export function Sidebar() {
  const { go } = usePlatform();
  const loc = useLoc();
  const w = WS[loc.ws];
  const lv = (n: number, c: string) => <div className="meter"><i style={{ width: `${(n / 3) * 100}%`, background: c }} /></div>;
  return (
    <aside className="side">
      <div className="side-ws">
        <WsIcon ws={loc.ws} size={32} />
        <div style={{ minWidth: 0 }}><div className="n">{w.name}</div><div className="s">{w.sub}</div></div>
      </div>
      <NavItems />
      <div className="side-foot">
        <div className="tag">Platform layers in this workspace</div>
        <div className="stack-mini">
          <div className="stack-row">Run {lv(w.em.r, 'var(--run)')}</div>
          <div className="stack-row">Build {lv(w.em.b, 'var(--bld)')}</div>
          <div className="stack-row">Understand {lv(w.em.u, 'var(--und)')}</div>
        </div>
        <button className="btn sm ghost" style={{ marginTop: 8, paddingLeft: 0 }} onClick={() => go(loc.ws, 'platform')}>View architecture →</button>
      </div>
    </aside>
  );
}

export const MobileNav = () => <nav className="mobile-nav"><NavItems mobile /></nav>;

export function Toasts() {
  const { toasts } = usePlatform();
  return <div className="toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}</div>;
}

/** "Same agent object, other views" — links an agent across workspaces. */
export function AlsoSeen({ agentId, except }: { agentId: string; except: WorkspaceId }) {
  const { canOpen, role, go } = usePlatform();
  const a = useLookup().agent(agentId);
  if (!a) return null;
  const opts: [WorkspaceId, string, string][] = ([
    ['fde', 'FDE Workbench', 'workflow · rules · versions'],
    ['ops', 'Control Tower', 'runs · SLA · incidents · cost'],
    ['cust', 'Customer Portal', 'health · value · approvals'],
  ] as [WorkspaceId, string, string][]).filter(o => o[0] !== except && (o[0] === 'ops' || a.cust === 'lala'));
  return (
    <div className="note" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <span><b style={{ color: 'var(--fg)' }}>Same agent object, other views:</b></span>
      {opts.map(o => canOpen(o[0])
        ? <button key={o[0]} className="chip click" onClick={() => go(o[0], 'agent', agentId)}>{o[1]} <span className="faint">· {o[2]}</span></button>
        : <span key={o[0]} className="chip" style={{ opacity: 0.55 }} title={`Not available for ${ROLES[role].n}`}>{o[1]} · locked</span>)}
    </div>
  );
}
