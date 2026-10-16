import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

/**
 * POST /api/ingest/finn — webhook FINN calls when a meeting transcript is ready.
 *
 * Expected headers: x-finn-signature: sha256=<hex HMAC of the raw body using FINN_WEBHOOK_SECRET>
 * Expected body:
 * {
 *   "meetingId": "slack-call-123", "accountName": "Grupo Lala", "title": "AP Automation Discovery",
 *   "startedAt": "2026-10-15T15:00:00Z", "participants": [{ "name": "...", "email": "..." }],
 *   "transcript": [{ "speaker": "...", "text": "...", "ts": 12.3 }]
 * }
 *
 * Production TODO:
 *  1. Store the raw transcript in blob storage.
 *  2. Upsert the meeting row (status: "processing") and match it to the CRM account.
 *  3. Enqueue background extraction (Claude, structured output) → discovery context + score.
 *  4. Mark the meeting "ready" so it appears in Sales Intelligence.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.FINN_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: 'FINN_WEBHOOK_SECRET not configured' }, { status: 500 });

  const sig = req.headers.get('x-finn-signature') ?? '';
  const expected = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
  const valid = sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!valid) return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 });

  let payload: { meetingId?: string; accountName?: string; transcript?: unknown[] };
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 }); }
  if (!payload.meetingId || !Array.isArray(payload.transcript)) {
    return NextResponse.json({ ok: false, error: 'meetingId and transcript are required' }, { status: 400 });
  }

  // Mock phase: acknowledge only. See TODO above for the production pipeline.
  return NextResponse.json({ ok: true, meetingId: payload.meetingId, status: 'accepted' }, { status: 202 });
}
