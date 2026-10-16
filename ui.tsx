'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { STAGE_COLOR } from '@/lib/constants';
import { href } from '@/lib/workspaces';
import type { Stage, WorkspaceId } from '@/lib/types';
import { useLoc, useLookup, usePlatform } from './platform-provider';

export type To = [WorkspaceId, string?, (string | null)?, (string | null)?];

const ST: Record<string, string> = { ok: 'Healthy', warn: 'Warning', crit: 'Critical', info: 'In progress' };

export const Pill = ({ cls = '', children }: { cls?: string; children: ReactNode }) => <span className={`pill ${cls}`}>{children}</span>;
export const StPill = ({ s }: { s: string }) => <Pill cls={s}>{ST[s] ?? s}</Pill>;

export function StagePill({ stage }: { stage: Stage }) {
  const c = STAGE_COLOR[stage];
  return (
    <span className="pill nodot" style={{ background: `color-mix(in srgb,${c} 16%,transparent)`, color: `color-mix(in srgb,${c} 72%,var(--fg))` }}>
      {stage}
    </span>
  );
}

export function Avatar({ id, size = 22 }: { id: string; size?: number }) {
  const p = useLookup().person(id);
  return <span className="avatar" title={p.n} style={{ width: size, height: size, fontSize: size < 24 ? 9.5 : 11 }}>{p.i}</span>;
}

export function PersonChip({ id }: { id: string }) {
  const p = useLookup().person(id);
  return <span style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}><Avatar id={id} /><span>{p.n}</span></span>;
}

export const Meter = ({ pct, color = 'var(--accent)' }: { pct: number; color?: string }) => (
  <div className="meter"><i style={{ width: `${Math.min(100, pct)}%`, background: color }} /></div>
);

export const Dot = ({ s }: { s?: string }) => <span className={`dot ${s ?? ''}`} />;

export function Layers({ a }: { a: string }) {
  return (
    <div className="layers">
      <span className="cap">Layers</span>
      <span className={`lt ${a.includes('u') ? 'u' : ''}`}>UNDERSTAND</span>
      <span className={`lt ${a.includes('b') ? 'b' : ''}`}>BUILD</span>
      <span className={`lt ${a.includes('r') ? 'r' : ''}`}>RUN</span>
    </div>
  );
}

/** Navigate on click, respecting role access. */
export function useGo() {
  const { go } = usePlatform();
  return (to: To) => go(to[0], to[1], to[2] ?? null, to[3] ?? null);
}

export type Crumb = string | [string, To];
export function PageHeader({ crumbs = [], title, sub, ly, actions }: { crumbs?: Crumb[]; title: ReactNode; sub?: ReactNode; ly?: string; actions?: ReactNode }) {
  const go = useGo();
  return (
    <div className="ph">
      <div className="ph-l">
        {crumbs.length > 0 && (
          <div className="crumbs">
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: 'contents' }}>
                {i > 0 && <span>/</span>}
                {Array.isArray(c) ? <button onClick={() => go(c[1])}>{c[0]}</button> : <span>{c}</span>}
              </span>
            ))}
          </div>
        )}
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="ph-r">{ly && <Layers a={ly} />}{actions}</div>
    </div>
  );
}

export function Card({ head, children, tight, className = '', style, onClick }: { head?: ReactNode; children?: ReactNode; tight?: boolean; className?: string; style?: CSSProperties; onClick?: () => void }) {
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {head && <div className="card-h">{head}</div>}
      <div className={`card-b ${tight ? 'tight' : ''}`}>{children}</div>
    </div>
  );
}

export function Kpi({ k, v, d, onClick }: { k: ReactNode; v: ReactNode; d?: ReactNode; onClick?: () => void }) {
  return (
    <div className={`kpi ${onClick ? 'click' : ''}`} onClick={onClick}>
      <div className="k">{k}</div><div className="v">{v}</div>{d && <div className="d">{d}</div>}
    </div>
  );
}
export const Kpis = ({ children }: { children: ReactNode }) => <div className="kpis">{children}</div>;

const RIGHT = /^(Value|Runs|Cost|Success|Autonomy|SLA|Exc|Score|Cases|Passing|Agents|HITL|p95|Reuse|Amount|Incidents|Transactions)/;
export function Table({ cols, children, empty }: { cols: string[]; children: ReactNode; empty?: ReactNode }) {
  return (
    <div className="tw">
      <table className="tbl">
        <thead><tr>{cols.map(c => <th key={c} className={RIGHT.test(c) ? 'r' : ''}>{c}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

/** Renders status keywords in mock tables as pills / trend labels. */
export function Cell({ v }: { v: string }) {
  if (v === 'ok' || v === 'warn' || v === 'crit' || v === 'info') return <StPill s={v} />;
  if (v === 'up') return <span style={{ color: 'var(--ok)' }}>▲ improving</span>;
  if (v === 'down') return <span style={{ color: 'var(--crit)' }}>▼ declining</span>;
  if (v === 'flat') return <span className="faint">— stable</span>;
  return <>{v}</>;
}

export function SimpleTable({ def, onRow, labels }: { def: { cols: string[]; rows: string[][] }; onRow?: (r: string[]) => (() => void) | undefined; labels?: Record<string, ReactNode> }) {
  return (
    <Table cols={def.cols}>
      {def.rows.map((r, i) => {
        const click = onRow?.(r);
        return (
          <tr key={i} className={click ? 'click' : ''} onClick={click}>
            {r.map((v, j) => <td key={j} className={j === 0 ? 'nm' : ''}>{labels && v in labels ? labels[v] : <Cell v={v} />}</td>)}
          </tr>
        );
      })}
    </Table>
  );
}

/** Tabs bound to the ?tab= URL parameter. */
export function UrlTabs({ list, cur, style }: { list: [string, string, (string | number)?][]; cur: string; style?: CSSProperties }) {
  const router = useRouter();
  const loc = useLoc();
  return (
    <div className="tabs" style={style}>
      {list.map(([k, l, c]) => (
        <button key={k} className={`tab ${cur === k ? 'on' : ''}`} onClick={() => router.replace(href(loc.ws, loc.route, loc.param, k), { scroll: false })}>
          {l}{c != null && <span className="c">{c}</span>}
        </button>
      ))}
    </div>
  );
}

export function Flow({ steps, pcts }: { steps: string[]; pcts?: string[] }) {
  return (
    <div className="flow">
      {steps.map((s, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span className="ar" />}
          <span className={`st ${/approval|review/i.test(s) ? 'hum' : ''}`}>{s}{pcts && <span className="pct">{pcts[i]}</span>}</span>
        </span>
      ))}
    </div>
  );
}

export const Check = ({ ok, children, style }: { ok: boolean; children: ReactNode; style?: CSSProperties }) => (
  <div className="check" style={style}><span className={`bx ${ok ? 'y' : 'n'}`}>{ok ? '✓' : '•'}</span>{children}</div>
);

export const Note = ({ cls = '', children, style }: { cls?: string; children: ReactNode; style?: CSSProperties }) => (
  <div className={`note ${cls}`} style={style}>{children}</div>
);

export const Tag = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div className="tag" style={style}>{children}</div>;

export function ReadinessCell({ ready }: { ready: string }) {
  if (ready === 'Live') return <Pill cls="ok">Live</Pill>;
  if (/%$/.test(ready)) {
    const n = parseInt(ready, 10);
    return <div className="bar-in"><Meter pct={n} color={n > 85 ? 'var(--ok)' : n > 60 ? 'var(--accent)' : 'var(--warn)'} /><span className="num">{ready}</span></div>;
  }
  return <Pill cls={ready === 'High' ? 'ok' : ready === 'Medium' ? 'info' : 'warn'}>{ready}</Pill>;
}

/** Toast-only action button for features that are out of scope for the mock (opens external tools, etc.). */
export function ToastBtn({ msg, className = 'btn', children, style }: { msg: string; className?: string; children: ReactNode; style?: CSSProperties }) {
  const { toast } = usePlatform();
  return <button className={className} style={style} onClick={() => toast(msg)}>{children}</button>;
}
