import 'server-only';
import { createSeed } from '../data/seed';
import type { PlatformDb } from '../types';

/**
 * Data access layer.
 *
 * MOCK PHASE: an in-memory copy of the seed data. It resets when the server restarts and is
 * not shared between serverless instances on Vercel — fine for demos, not for real use.
 *
 * PRODUCTION: replace the body of these functions with database queries (Postgres via
 * Drizzle/Prisma). Keep the function signatures so the API routes and UI don't change.
 * Enforce customer scoping here (or with Postgres row-level security), never in the UI.
 */
const g = globalThis as unknown as { __beeckerDb?: PlatformDb };

function db(): PlatformDb {
  if (!g.__beeckerDb) g.__beeckerDb = createSeed();
  return g.__beeckerDb;
}

export function getSnapshot(): PlatformDb {
  return structuredClone(db());
}

/** Apply a mutation from lib/mutations.ts to the store and return its message. */
export function mutate(fn: (d: PlatformDb) => string): string {
  const draft = structuredClone(db());
  const msg = fn(draft);
  g.__beeckerDb = draft;
  return msg;
}

export function resetDb() {
  g.__beeckerDb = createSeed();
}
