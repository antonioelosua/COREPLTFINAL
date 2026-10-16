'use client';

import { useEffect, useRef } from 'react';
import { Ring } from './charts';
import { usePlatform } from './platform-provider';
import { WsIcon } from './shell';
import { Check } from './ui';

const STEPS = ['FINN', 'Discovery', 'AI Initiative', 'FDE Workbench', 'Build', 'Deploy', 'Operate', 'Expand'];
const LINES = [
  'Transcript and extracted context attached',
  'Linked to Grupo Lala operational map · Procure-to-Pay',
  'Reuse detected: 74% · Invoice Processing Agent workflow, entities, HITL matrix',
  'Initiative created in FDE Workbench → Discover · Mariana Ortega notified',
];

function Handoff({ step }: { step: number }) {
  const { setModal, actions, canOpen, go } = usePlatform();
  const created = useRef(false);
  useEffect(() => {
    if (step >= 4) {
      if (!created.current) { created.current = true; actions.createInitiative('lala-ap'); }
      return;
    }
    const t = setTimeout(() => setModal({ kind: 'handoff', step: step + 1 }), step === 0 ? 420 : 520);
    return () => clearTimeout(t);
  }, [step, setModal, actions]);

  return (
    <>
      <div className="modal-h">
        <WsIcon ws="finn" />
        <div><h2>Creating AI initiative</h2><div className="faint">Invoice Exception Agent · Grupo Lala</div></div>
        <button className="x" aria-label="Close" onClick={() => setModal(null)}>×</button>
      </div>
      <div className="modal-b">
        <div className="journey" style={{ marginBottom: 16 }}>
          {STEPS.map((s, i) => (
            <div key={s} className={`jstep ${i < step ? 'done' : ''} ${i === step && step < 4 ? 'on' : ''}`} style={i === 3 && step >= 4 ? { background: 'var(--accent-weak)' } : undefined}>
              <div className="n">{s}</div>
            </div>
          ))}
        </div>
        <div className="rows">
          {LINES.map((l, i) => (
            <div key={l} className="row" style={{ padding: '8px 0', opacity: i < step ? 1 : 0.35 }}>
              <span className={`dot ${i < step ? 'ok' : ''}`} /><span className="grow">{l}</span>
            </div>
          ))}
        </div>
        {step >= 4 && <div className="note info" style={{ marginTop: 12 }}>The opportunity is now a shared AI Initiative. The FDE team builds it, ROC operates it, Grupo Lala sees it in their portal, and FINN tracks the expansion.</div>}
      </div>
      <div className="modal-f">
        {step < 4 ? <span className="faint">Working…</span> : canOpen('fde') ? (
          <>
            <button className="btn" onClick={() => setModal(null)}>Stay in FINN</button>
            <button className="btn primary" onClick={() => go('fde', 'discovery', 'invexc')}>Open in FDE Workbench</button>
          </>
        ) : (
          <>
            <span className="faint" style={{ marginRight: 'auto' }}>Your role can’t open FDE Workbench. The delivery team has it.</span>
            <button className="btn primary" onClick={() => setModal(null)}>Done</button>
          </>
        )}
      </div>
    </>
  );
}

function NewInitiative() {
  const { db, setModal, go } = usePlatform();
  const R = db.reuse.suprec;
  return (
    <>
      <div className="modal-h"><h2>New initiative</h2><button className="x" aria-label="Close" onClick={() => setModal(null)}>×</button></div>
      <div className="modal-b">
        <div className="grid g2">
          <div className="form">
            <div className="fg"><label htmlFor="ni-n">Name</label><input id="ni-n" defaultValue="Supplier Reconciliation Agent" /></div>
            <div className="fg"><label htmlFor="ni-p">Process</label><select id="ni-p" defaultValue="Procure-to-Pay"><option>Procure-to-Pay</option><option>Order-to-Cash</option><option>Record-to-Report</option></select></div>
            <div className="fg"><label>Systems</label><div className="chips"><span className="chip">SAP S/4HANA</span><span className="chip">SharePoint</span></div></div>
            <div className="fg"><label>Entities</label><div className="chips"><span className="chip">Vendor</span><span className="chip">Invoice</span><span className="chip">Payment</span></div></div>
          </div>
          <div>
            <div className="tag" style={{ marginBottom: 8 }}>Reusable capabilities detected</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <Ring p={R.pct} c="var(--ok)" size={72} />
              <div><b style={{ fontSize: 18 }}>{R.weeks} weeks</b><div className="faint">estimated implementation</div></div>
            </div>
            {R.have.slice(0, 6).map(h => <Check key={h[0]} ok style={{ padding: '3px 0' }}><span>{h[0]}</span></Check>)}
            {R.need.map(h => <Check key={h} ok={false} style={{ padding: '3px 0' }}><span>{h}</span></Check>)}
          </div>
        </div>
      </div>
      <div className="modal-f">
        <button className="btn" onClick={() => setModal(null)}>Cancel</button>
        <button className="btn primary" onClick={() => go('fde', 'discovery', 'suprec')}>Create and open discovery</button>
      </div>
    </>
  );
}

export function Modals() {
  const { modal, setModal } = usePlatform();
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modal, setModal]);
  if (!modal) return null;
  return (
    <div className="scrim" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
      <div className="modal" role="dialog" aria-modal="true">
        {modal.kind === 'handoff' ? <Handoff step={modal.step} /> : <NewInitiative />}
      </div>
    </div>
  );
}
