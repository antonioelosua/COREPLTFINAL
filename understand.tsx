'use client';

import { useMemo } from 'react';
import type { PlatformDb } from '@/lib/types';
import { usePlatform } from '@/components/platform-provider';
import { Card, PageHeader, SimpleTable, Tag, ToastBtn, UrlTabs, useGo } from '@/components/ui';

const COL_X = 214, ROW_Y = 38, NODE_W = 186;

/** Upstream + downstream trace from a node. */
function connected(db: PlatformDb, id: string) {
  const set = new Set([id]);
  const fw = [id];
  while (fw.length) { const c = fw.pop()!; db.mapEdges.forEach(([a, b]) => { if (a === c && !set.has(b)) { set.add(b); fw.push(b); } }); }
  const up = new Set<string>(); const bw = [id];
  while (bw.length) { const c = bw.pop()!; db.mapEdges.forEach(([a, b]) => { if (b === c && !up.has(a)) { up.add(a); bw.push(a); } }); }
  up.forEach(x => set.add(x));
  return set;
}

export function OperationalMap() {
  const { db, mapSel: sel, setMapSel } = usePlatform();
  const go = useGo();
  const pos = useMemo(() => {
    const p: Record<string, { x: number; y: number }> = {};
    db.mapCols.forEach((c, ci) => db.mapNodes.filter(n => n.col === c.k).forEach((n, ri) => { p[n.id] = { x: 16 + ci * COL_X, y: 44 + ri * ROW_Y }; }));
    return p;
  }, [db.mapCols, db.mapNodes]);
  const con = sel ? connected(db, sel) : null;
  const colC = Object.fromEntries(db.mapCols.map(c => [c.k, c.c]));
  const W = 16 + 4 * COL_X + NODE_W + 16, H = 44 + 10 * ROW_Y + 10;

  const node = db.mapNodes.find(n => n.id === sel);
  const D = sel ? db.mapDetail[sel] : undefined;
  const nb = (down: boolean) => db.mapEdges.filter(e => (down ? e[0] === sel : e[1] === sel)).map(e => db.mapNodes.find(n => n.id === (down ? e[1] : e[0]))!.label);
  const List = ({ t, arr }: { t: string; arr?: string[] }) => arr && arr.length ? (
    <div style={{ marginTop: 12 }}><Tag style={{ marginBottom: 6 }}>{t}</Tag><div className="chips">{arr.map(x => <span key={x} className="chip">{x}</span>)}</div></div>
  ) : null;

  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Understand']} title="Operational Map" ly="u"
        sub="Only what agents need to do the work: the systems, business objects, processes, actions, rules and permissions behind Grupo Lala’s AI portfolio. Click any element to trace it."
        actions={<><button className="btn" onClick={() => go(['fde', 'catalog', null, 'entities'])}>Table view</button><ToastBtn msg="Import started · SAP BP schema and 2 SOPs will be proposed as map changes for review">Import from system</ToastBtn></>} />
      <div className="grid">
        <div className="card">
          <div className="card-h">
            <div className="legend">{db.mapCols.map(c => <span key={c.k}><i style={{ background: c.c }} />{c.t}</span>)}<span className="faint">Rules and permissions attach to entities and actions</span></div>
            <div className="r"><div className="seg">
              <button className={sel === 'vendor' ? 'on' : ''} onClick={() => setMapSel('vendor')}>Vendor</button>
              <button className={sel === 'invoice' ? 'on' : ''} onClick={() => setMapSel('invoice')}>Invoice</button>
              <button onClick={() => setMapSel(null)}>Clear</button>
            </div></div>
          </div>
          <div className="canvas">
            <div className="canvas-in" style={{ width: W, height: H }}>
              {db.mapCols.map((c, ci) => <div key={c.k} className="map-col-h" style={{ left: 16 + ci * COL_X }}>{c.t}</div>)}
              <svg className="edges" width={W} height={H}>
                {db.mapEdges.map(([a, b], k) => {
                  const p = pos[a], q = pos[b];
                  const x1 = p.x + NODE_W, y1 = p.y + 16, x2 = q.x, y2 = q.y + 16, mx = (x1 + x2) / 2;
                  const hot = !!con && con.has(a) && con.has(b);
                  return <path key={k} className={hot ? 'hot' : ''} style={con && !hot ? { opacity: 0.25 } : undefined} d={`M${x1} ${y1} C${mx} ${y1},${mx} ${y2},${x2} ${y2}`} />;
                })}
              </svg>
              {db.mapNodes.map(n => (
                <button key={n.id} className={`mnode ${n.id === sel ? 'on' : ''} ${con && !con.has(n.id) ? 'dim' : ''}`} style={{ left: pos[n.id].x, top: pos[n.id].y, width: NODE_W }} onClick={() => setMapSel(n.id)}>
                  <i style={{ background: colC[n.col] }} />{n.label}{db.ruleCounts[n.id] && <span className="cnt">{db.ruleCounts[n.id]}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Card>
          {!node ? <div className="empty">Select an element on the map</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '4px 28px' }}>
              <div>
                <div className="tag">{D?.kind ?? db.mapCols.find(c => c.k === node.col)!.t.replace(/s$/, '')}</div>
                <h2 style={{ fontSize: 17, marginTop: 3 }}>{node.label}</h2>
                {D?.desc && <p className="muted" style={{ margin: '6px 0 0' }}>{D.desc}</p>}
                {D?.go && <button className="btn sm primary" style={{ marginTop: 10 }} onClick={() => go(D.go!)}>Open</button>}
                {D?.learned && <div className="note" style={{ marginTop: 14 }}>{D.learned}</div>}
              </div>
              <div>
                {D?.systems ? <List t="Systems" arr={D.systems} /> : <List t="Upstream" arr={nb(false)} />}
                {D?.usedBy ? <List t="Used by" arr={D.usedBy} /> : <List t="Downstream" arr={nb(true)} />}
                <List t="Actions" arr={D?.actions} />
              </div>
              <div>
                <List t="Rules" arr={D?.rules} />
                <List t="Permissions" arr={D?.perms} />
                {D?.fields && <div style={{ marginTop: 12 }}><Tag style={{ marginBottom: 6 }}>Fields</Tag><div className="mono muted">{D.fields}</div></div>}
                <List t="Knowledge" arr={D?.knowledge} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

const CAT_T: Record<string, string> = { systems: 'Systems', entities: 'Entities', processes: 'Workflows', knowledge: 'Knowledge', rules: 'Rules', actions: 'Actions', permissions: 'Permissions' };

export function Catalog({ tab }: { tab: string | null }) {
  const { db, setMapSel, go: goRaw } = usePlatform();
  const go = useGo();
  const t = tab && CAT_T[tab] ? tab : 'systems';
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Understand']} title={CAT_T[t]} ly="u"
        sub="Part of Grupo Lala’s operational map. Every agent built here reads from the same definitions."
        actions={<><button className="btn" onClick={() => go(['fde', 'map'])}>Map view</button><ToastBtn className="btn primary" msg={`New ${CAT_T[t].toLowerCase().replace(/s$/, '')} drafted · pending review by Mariana Ortega`}>Add</ToastBtn></>} />
      <UrlTabs list={Object.entries(CAT_T).map(([k, l]) => [k, l, db.catalog[k].rows.length])} cur={t} />
      <Card tight>
        <SimpleTable def={db.catalog[t]} onRow={r => (r[0] === 'Vendor' ? () => { setMapSel('vendor'); goRaw('fde', 'map'); } : undefined)} />
      </Card>
    </>
  );
}
