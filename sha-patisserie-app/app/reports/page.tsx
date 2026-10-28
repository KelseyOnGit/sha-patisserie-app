import { redirect } from 'next/navigation';
import TimesheetReview from '@/components/TimesheetReview';
import { getSession, isPrivilegedRole } from '@/lib/session';

// The legacy reports URL uses the same approval-aware payroll view, so it cannot
// continue exporting scheduled hours or bypass the admin/manager access check.
export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!isPrivilegedRole(session.role)) redirect('/dashboard');
  return <TimesheetReview userId={session.userId} />;
}
