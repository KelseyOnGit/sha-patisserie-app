import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import AccountRoleButton from '@/components/AccountRoleButton';

export default async function AdminAccountsPage() {
  const session = await getSession();
  if (session?.role !== 'ADMIN') redirect('/dashboard');
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', isApproved: true },
    select: { id: true, name: true, email: true, status: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Admin Users</h1>
        <p className="mt-2 text-sm text-stone-600">Admin accounts are separate from staff scheduling. Move an account back to Staff without deleting its profile or history.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500"><tr>{['Name', 'Email', 'Status', 'Action'].map((heading) => <th key={heading} className="px-6 py-3">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-stone-100">
            {admins.length === 0 && <tr><td colSpan={4} className="p-6 text-stone-500">No approved Admin accounts.</td></tr>}
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 font-semibold">{admin.name || 'Unnamed Admin'}</td>
                <td className="px-6 py-4">{admin.email}</td>
                <td className="px-6 py-4">{admin.status}</td>
                <td className="space-x-3 px-6 py-4">
                  <Link href={`/admin/staff/${admin.id}`} className="text-stone-700 underline">View Profile</Link>
                  {admin.id === session.userId ? <span className="text-xs text-stone-500">Your account</span> : <AccountRoleButton userId={admin.id} name={admin.name || admin.email} role="STAFF" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
