import 'server-only';
import { NextResponse } from 'next/server';
import { mutate } from './repo';
import type { PlatformDb } from '../types';

export function runMutation(fn: (d: PlatformDb) => string) {
  try {
    const message = mutate(fn);
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
