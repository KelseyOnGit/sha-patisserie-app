import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import { getSession, isPrivilegedRole } from '@/lib/session'
//the navigation area remains static on the screen while {children} updates dynamically 
// as the admin navigates between sub-pages.
//build the navigation bar
export default async function AdminLayout({
    children}: {
        children: React.ReactNode;
    }) {
      const session = await getSession();

      if (!session) {
        redirect('/login');
      }

      if (!isPrivilegedRole(session.role)) {
        redirect('/dashboard');
      }

      return  (
        <div className="min-h-screen flex flex-col md:flex-row bg-stone-100">
            {/* Sidebar or Top Navigation Bar Container */}
            <aside className="w-full md:w-64 bg-stone-900 text-stone-100 p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-serif mb-6">Admin Panel</h2>
                    <nav className="space-y-4">
                    <Link href="/admin/roster" className="block text-sm hover:text-stone-300">
                        Roster
                    </Link>
                    <Link href="/admin/users" className="block text-sm hover:text-stone-300">
                        Pending Users
                    </Link>
                    </nav>
                </div>

                {/* Logout Action */}
                <div className="pt-6 border-t border-stone-800">
                    <LogoutButton>Log out</LogoutButton>
                </div>
            </aside>

            {/* Main Content Area where sub-pages render */}
            <main className="flex-1 p-6 sm:p-10">
              {children}
            </main>
        </div>
      );
    }
