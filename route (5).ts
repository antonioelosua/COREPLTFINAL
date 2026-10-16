import { createInitiativeFromMeeting } from '@/lib/mutations';
import { runMutation } from '@/lib/server/http';

/** POST /api/initiatives { fromMeeting: string } — FINN → AI Initiative handoff. */
export async function POST(req: Request) {
  const { fromMeeting } = (await req.json()) as { fromMeeting: string };
  return runMutation(d => createInitiativeFromMeeting(d, fromMeeting));
}
