import { auth } from '@/server/modules/auth/auth.config'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-muted/20">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-4">
        {children}
      </main>
    </div>
  )
}
