import {prisma} from '@/lib/prisma';
import PendingUsersList from '@/components/PendingUsersList';

//pass a select object directly inside findMany
export default async function AdminUserPage() {
    const pendingUsers = await prisma.user.findMany({
        where: {isApproved : false},
        select: {
            id: true,
            name: true,
            email: true,
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
            <PendingUsersList initialUsers={formattedUsers} />

        
        </main>


    )

}