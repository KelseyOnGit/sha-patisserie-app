import { redirect } from 'next/navigation';

// Roster posting moved under the auth-protected /admin section
export default function RosterRedirectPage() {
  redirect('/admin/roster');
}