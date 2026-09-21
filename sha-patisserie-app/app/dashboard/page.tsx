import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export default async function StaffPortalPage() {
  //  Decode the JWT session cookie to extract user information
  const payload = await getSession();

  if (!payload || !payload.userId) {
    redirect('/login');
  }

  //fetch the logged-in user directly from PostgreSQL using Prisma or another database client

  const user = await prisma.user.findUnique({
    where: {id: payload.userId},
    select:{
      name: true,
      email: true
    }
  });

  if(!user) {
    redirect('/login');
  }
  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 max-w-5xl mx-auto">
      {/* Top Header Section */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
            Staff Portal
          </span>
          <h1 className="text-3xl font-serif text-stone-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
        </div>

        {/* Sign Out Button */}
        <div className="w-28">
          <LogoutButton>Log out</LogoutButton>
        </div>
      </header>

  
      {/* Main Shift Card */}
      <main className="bg-white border border-stone-200/80 shadow-sm rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
          ⏱️
        </div>
        <h2 className="text-xl font-serif text-stone-800 mb-2">
          Ready for your shift?
        </h2>
        <p className="text-sm text-stone-500 max-w-sm">
          Clock-in feature and shift management will be connected here next.
        </p>
      </main>
    </div>
  );
}
