'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as M from '@/lib/mutations';
import { HOME, ROLES, WS, href } from '@/lib/workspaces';
import type { IncidentAction, PlatformDb, RoleId, WorkspaceId } from '@/lib/types';

export interface OpsFilters { cust: string; q: string; env: string; status: string; host: string; period: string }
type Modal = { kind: 'handoff'; step: number } | { kind: 'newini' } | null;

interface Ctx {
  db: PlatformDb;
  role: RoleId; setRole: (r: RoleId) => void;
  env: string; setEnv: (e: string) => void;
  filters: OpsFilters; setFilter: (k: keyof OpsFilters, v: string) => void;
  mapSel: string | null; setMapSel: (v: string | null) => void;
  nodeSel: string; setNodeSel: (v: string) => void;
  hitlSel: string | null; setHitlSel: (v: string | null) => void;
  modal: Modal; setModal: (m: Modal) => void;
  toasts: { id: number; msg: string }[]; toast: (msg: string) => void;
  go: (ws: WorkspaceId, route?: string, param?: string | null, tab?: string | null) => void;
  canOpen: (ws: WorkspaceId) => boolean;
  actions: {
    hitl: (id: string, d: M.HitlDecision) => void;
    incident: (id: string, a: IncidentAction) => void;
    approval: (id: string, d: M.ApprovalDecision) => void;
    createInitiative: (meetingId: string) => void;
    moveToBuild: (id: string) => void;
    requestOpp: (id: string) => void;
  };
}

const PlatformCtx = createContext<Ctx | null>(null);

export function usePlatform() {
  const c = useContext(PlatformCtx);
  if (!c) throw new Error('usePlatform must be used inside <PlatformProvider>');
  return c;
}

/** Current screen, parsed from the URL: /{ws}/{route}/{param}?tab= */
export function useLoc() {
  const path = usePathname() || '/fde';
  const sp = useSearchParams();
  const [wsRaw, routeRaw, paramRaw] = path.split('/').filter(Boolean);
  const ws = (wsRaw in WS ? wsRaw : 'fde') as WorkspaceId;
  return {
    ws,
    route: routeRaw ?? HOME[ws],
    param: paramRaw ? decodeURIComponent(paramRaw) : null,
    tab: sp.get('tab'),
  };
}

export function PlatformProvider({ initialDb, initialRole, children }: { initialDb: PlatformDb; initialRole: RoleId; children: ReactNode }) {
  const router = useRouter();
  const [db, setDb] = useState(initialDb);
  const dbRef = useRef(db);
  dbRef.current = db;
  const [role, setRoleState] = useState<RoleId>(initialRole);
  const [env, setEnv] = useState('Production');
  const [filters, setFilters] = useState<OpsFilters>({ cust: 'all', q: '', env: 'all', status: 'all', host: 'all', period: '24h' });
  const [mapSel, setMapSel] = useState<string | null>('vendor');
  const [nodeSel, setNodeSel] = useState('n4');
  const [hitlSel, setHitlSel] = useState<string | null>('h1');
  const [modal, setModal] = useState<Modal>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((msg: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3400);
  }, []);

  const canOpen = useCallback((ws: WorkspaceId) => ROLES[role].ws.includes(ws), [role]);

  const go = useCallback((ws: WorkspaceId, route?: string, param?: string | null, tab?: string | null) => {
    if (!ROLES[role].ws.includes(ws)) { toast(`${ROLES[role].n} can’t open ${WS[ws].name}.`); return; }
    setModal(null);
    router.push(href(ws, route, param, tab));
  }, [role, router, toast]);

  const setRole = useCallback((r: RoleId) => {
    setRoleState(r);
    // Mock auth: the role lives in a cookie. In production it comes from the SSO session.
    document.cookie = `bp_role=${r}; path=/; max-age=31536000; samesite=lax`;
    toast(`Previewing as ${ROLES[r].n} · ${ROLES[r].who}`);
  }, [toast]);

  const setFilter = useCallback((k: keyof OpsFilters, v: string) => setFilters(f => ({ ...f, [k]: v })), []);

  /** Optimistic update with the shared mutation, then persist through the API. */
  const run = useCallback(async (fn: (d: PlatformDb) => string, url: string, method: 'POST' | 'PATCH', body: unknown) => {
    const draft = structuredClone(dbRef.current);
    let msg: string;
    try { msg = fn(draft); } catch (e) { toast((e as Error).message); return; }
    setDb(draft);
    toast(msg);
    try {
      const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
    } catch (e) {
      toast(`Could not save: ${(e as Error).message}. Reloading data.`);
      const fresh = await fetch('/api/snapshot').then(r => r.json()).catch(() => null);
      if (fresh) setDb(fresh);
    }
  }, [toast]);

  const actions = useMemo<Ctx['actions']>(() => ({
    hitl: (id, d) => run(x => M.hitlDecision(x, id, d), `/api/hitl/${id}/decision`, 'POST', { decision: d }),
    incident: (id, a) => run(x => M.incidentAction(x, id, a), `/api/incidents/${id}/actions`, 'POST', { action: a }),
    approval: (id, d) => run(x => M.approvalDecision(x, id, d), `/api/approvals/${id}/decision`, 'POST', { decision: d }),
    createInitiative: meetingId => run(x => M.createInitiativeFromMeeting(x, meetingId), '/api/initiatives', 'POST', { fromMeeting: meetingId }),
    moveToBuild: id => run(x => M.moveToBuild(x, id), `/api/initiatives/${id}`, 'PATCH', { stage: 'Development' }),
    requestOpp: id => run(x => M.requestOpportunity(x, id), `/api/initiatives/${id}`, 'PATCH', { requested: true }),
  }), [run]);

  const value: Ctx = {
    db, role, setRole, env, setEnv, filters, setFilter, mapSel, setMapSel, nodeSel, setNodeSel, hitlSel, setHitlSel,
    modal, setModal, toasts, toast, go, canOpen, actions,
  };
  return <PlatformCtx.Provider value={value}>{children}</PlatformCtx.Provider>;
}

/** Lookup helpers bound to the current data. */
export function useLookup() {
  const { db } = usePlatform();
  return useMemo(() => ({
    agent: (id?: string | null) => db.agents.find(a => a.id === id),
    cust: (id?: string | null) => db.customers.find(c => c.id === id),
    ini: (id?: string | null) => db.initiatives.find(i => i.id === id),
    person: (id?: string | null) => (id && db.people[id]) || { n: id ?? '—', i: '?', r: '', org: '' },
  }), [db]);
}
