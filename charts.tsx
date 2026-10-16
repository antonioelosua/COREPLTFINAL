/** Lightweight SVG charts. One scale per chart; colors come from theme tokens. */

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

export interface Series { v: number[]; c: string; dash?: boolean }

export function LineChart({ series, labels, h = 190, w = 640, yfmt = v => String(v), ymin = 0, ymax, refLine, area = true }: {
  series: Series[]; labels: string[]; h?: number; w?: number; yfmt?: (v: number) => string; ymin?: number; ymax?: number;
  refLine?: { v: number; l: string; c?: string }; area?: boolean;
}) {
  const pl = 44, pr = 30, pt = 12, pb = 24, W = w - pl - pr, H = h - pt - pb;
  const mx = ymax ?? niceMax(Math.max(...series.flatMap(s => s.v)) * 1.08);
  const n = series[0].v.length;
  const X = (i: number) => pl + (n === 1 ? W / 2 : (i * W) / (n - 1));
  const Y = (v: number) => pt + H - ((v - ymin) / (mx - ymin)) * H;
  const step = Math.ceil(n / 7);
  return (
    <div className="chart-wrap">
      <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img">
        {[0, 1, 2, 3, 4].map(t => {
          const v = ymin + ((mx - ymin) * t) / 4;
          return <g key={t}><line className="grid-l" x1={pl} x2={w - pr} y1={Y(v)} y2={Y(v)} /><text x={pl - 6} y={Y(v) + 3.5} textAnchor="end">{yfmt(v)}</text></g>;
        })}
        {labels.map((l, i) => (i % step === 0 ? <text key={i} x={X(i)} y={h - 6} textAnchor="middle">{l}</text> : null))}
        {series.map((s, si) => {
          const d = s.v.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
          return (
            <g key={si}>
              {area && si === 0 && <path d={`${d} L${X(n - 1)} ${Y(ymin)} L${X(0)} ${Y(ymin)} Z`} fill={s.c} fillOpacity={0.1} />}
              <path d={d} fill="none" stroke={s.c} strokeWidth={s.dash ? 1.5 : 2} strokeDasharray={s.dash ? '4 4' : undefined} strokeLinejoin="round" />
              {!s.dash && <circle cx={X(n - 1)} cy={Y(s.v[n - 1])} r={3.5} fill={s.c} stroke="var(--surface)" strokeWidth={2} />}
            </g>
          );
        })}
        {refLine && (
          <g>
            <line x1={pl} x2={w - pr} y1={Y(refLine.v)} y2={Y(refLine.v)} stroke={refLine.c ?? 'var(--crit)'} strokeDasharray="3 3" strokeWidth={1.2} />
            <text x={w - pr} y={Y(refLine.v) - 5} textAnchor="end" style={{ fill: refLine.c ?? 'var(--crit)' }}>{refLine.l}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function BarChart({ v, labels, h = 180, w = 640, yfmt = x => String(x), c = 'var(--accent)', hl = -1, horiz = false }: {
  v: number[]; labels: string[]; h?: number; w?: number; yfmt?: (x: number) => string; c?: string; hl?: number; horiz?: boolean;
}) {
  if (horiz) {
    const rowH = 26, pl = 170, pr = 60, W = w - pl - pr, mx = niceMax(Math.max(...v)), hh = v.length * rowH + 8;
    return (
      <div className="chart-wrap">
        <svg className="chart" viewBox={`0 0 ${w} ${hh}`}>
          {v.map((x, i) => (
            <g key={i}>
              <text x={pl - 8} y={i * rowH + 17} textAnchor="end" style={{ fill: 'var(--fg-2)' }}>{labels[i]}</text>
              <rect x={pl} y={i * rowH + 6} width={Math.max(2, (x / mx) * W)} height={15} rx={3} fill={i === hl ? 'var(--accent)' : c} />
              <text x={pl + (x / mx) * W + 6} y={i * rowH + 17}>{yfmt(x)}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }
  const pl = 44, pr = 10, pt = 12, pb = 24, W = w - pl - pr, H = h - pt - pb;
  const mx = niceMax(Math.max(...v) * 1.05), bw = W / v.length, step = Math.ceil(v.length / 10);
  return (
    <div className="chart-wrap">
      <svg className="chart" viewBox={`0 0 ${w} ${h}`}>
        {[0, 1, 2, 3, 4].map(t => {
          const y = pt + H - (H * t) / 4;
          return <g key={t}><line className="grid-l" x1={pl} x2={w - pr} y1={y} y2={y} /><text x={pl - 6} y={y + 3.5} textAnchor="end">{yfmt((mx * t) / 4)}</text></g>;
        })}
        {v.map((x, i) => {
          const bh = (x / mx) * H;
          return (
            <g key={i}>
              <rect x={pl + i * bw + bw * 0.18} y={pt + H - bh} width={bw * 0.64} height={bh} rx={2} fill={i === hl ? 'var(--accent)' : c} />
              {i % step === 0 && <text x={pl + i * bw + bw / 2} y={h - 6} textAnchor="middle">{labels[i]}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Spark({ v, c = 'var(--accent)', w = 96, h = 26 }: { v: number[]; c?: string; w?: number; h?: number }) {
  const mx = Math.max(...v), mn = Math.min(...v);
  const X = (i: number) => (i * (w - 4)) / (v.length - 1) + 2;
  const Y = (x: number) => h - 3 - ((x - mn) / (mx - mn || 1)) * (h - 6);
  const d = v.map((x, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x).toFixed(1)).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <path d={`${d} L${X(v.length - 1)} ${h} L2 ${h} Z`} fill={c} fillOpacity={0.12} />
      <path d={d} fill="none" stroke={c} strokeWidth={1.5} />
      <circle cx={X(v.length - 1)} cy={Y(v[v.length - 1])} r={2.2} fill={c} />
    </svg>
  );
}

export function Ring({ p, c = 'var(--accent)', size = 92 }: { p: number; c?: string; size?: number }) {
  const r = 38, C = 2 * Math.PI * r;
  return (
    <svg className="reuse-ring" viewBox="0 0 92 92" width={size} height={size}>
      <circle cx={46} cy={46} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={9} />
      <circle cx={46} cy={46} r={r} fill="none" stroke={c} strokeWidth={9} strokeDasharray={`${(C * p) / 100} ${C}`} strokeLinecap="round" transform="rotate(-90 46 46)" />
      <text x={46} y={51} textAnchor="middle" style={{ fontSize: 19, fontWeight: 600, fill: 'var(--fg)', fontFamily: 'var(--font)' }}>{p}%</text>
    </svg>
  );
}
