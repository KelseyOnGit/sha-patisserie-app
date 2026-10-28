import TimesheetReview from '@/components/TimesheetReview';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!isPrivilegedRole(session.role)) redirect('/dashboard');
  return <TimesheetReview userId={session.userId} />;
}