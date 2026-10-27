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
  try {
    pendingCount = await prisma.user.count({
      where: { isApproved: false },
    });
  } catch (error) {
    console.error('Failed to fetch pending user count:', error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 md:flex-row">
      <AdminNav role={session.role} pendingCount={pendingCount}>
        <LogoutButton>Log out</LogoutButton>
      </AdminNav>

      {/* min-w-0 stops wide content (tables, long text) from stretching the page past the screen */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
