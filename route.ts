import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/server/repo';

export const dynamic = 'force-dynamic';

/** GET /api/snapshot — everything the UI needs. Later: split into per-resource endpoints and scope by role. */
export function GET() {
  return NextResponse.json(getSnapshot());
}
