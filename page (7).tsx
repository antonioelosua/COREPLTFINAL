import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { HOME, ROLES, href, isRole } from '@/lib/workspaces';

export default async function Index() {
  const roleCookie = (await cookies()).get('bp_role')?.value;
  const ws = ROLES[isRole(roleCookie) ? roleCookie : 'admin'].ws[0];
  redirect(href(ws, HOME[ws]));
}
