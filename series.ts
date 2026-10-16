/** Deterministic pseudo-random series for mock charts (same output on server and client). */
export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function series(seed: number, n: number, base: number, vol: number, trend = 0): number[] {
  const r = rng(Math.round(seed));
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v = v + (r() - 0.5) * vol + trend;
    out.push(Math.max(0, v));
  }
  return out;
}

export const hours = Array.from({ length: 24 }, (_, i) => String((i + 11) % 24).padStart(2, '0') + ':00');
export const days30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 8, 16 + i));
  return d.getUTCMonth() + 1 + '/' + d.getUTCDate();
});
