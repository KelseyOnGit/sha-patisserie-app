import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import LogoutButton from '@/components/LogoutButton'
import { getSession, isPrivilegedRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (!isPrivilegedRole(session.role)) {
    redirect('/dashboard');
  }

  // Query pending user count directly on the server
  let pendingCount = 0;
  let pendingLeavesCount = 0;
  try {
    const [users, leaves] = await Promise.all([
      prisma.user.count({ where: { isApproved: false } }),
      prisma.leaveRequest.findMany({ where: { status: 'PENDING' }, select: { id: true, requestGroupId: true } }),
    ]);
    pendingCount = users;
    // One request spans many daily rows; count each request once.
    pendingLeavesCount = new Set(leaves.map((leave) => leave.requestGroupId ?? leave.id)).size;
  } catch (error) {
    console.error('Failed to fetch pending counts:', error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 md:flex-row">
      <AdminNav role={session.role} pendingUsersCount={pendingCount} pendingLeavesCount={pendingLeavesCount}>
        <LogoutButton>Log out</LogoutButton>
      </AdminNav>

      {/* min-w-0 stops wide content (tables, long text) from stretching the page past the screen */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
