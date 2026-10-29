import {prisma} from '@/lib/prisma';
import PendingUsersList from '@/components/PendingUsersList';
import { getSession, isPrivilegedRole } from '@/lib/session';
import { redirect } from 'next/navigation';
import { emailVerificationRequired } from '@/lib/auth-config';

//pass a select object directly inside findMany
export default async function AdminUserPage() {
    const session = await getSession();
    if (!session || !isPrivilegedRole(session.role)) redirect('/dashboard');
    const pendingUsers = await prisma.user.findMany({
        where: {isApproved : false},
        select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            createdAt: true,
        },
        orderBy: {
            createdAt:'desc',
        },
        
    })
    // Transform the array so dates are plain string 
    const formattedUsers = pendingUsers.map((user) => ({
        ...user,//spread operator 
        createdAt: user.createdAt.toISOString(),
    }))

    // Pass the formatted plain objets into your Client Component
    return (
        <main className="max-w-4xl mx-auto p-6">
            <h1 className="text-xl front-medium mb-4">Pending Approvals</h1>
            <p className="mb-4 text-sm text-stone-600">{emailVerificationRequired()
                ? 'Staff must verify their email before approval. Unverified sign-ups can still be removed.'
                : 'Email verification is temporarily disabled. Review each sign-up before approving access.'}</p>
            <PendingUsersList initialUsers={formattedUsers} canAssignAdmin={session.role === 'ADMIN'} requireEmailVerification={emailVerificationRequired()} />

        
        </main>


    )

}