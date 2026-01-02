import { auth } from '@/server/modules/auth/auth.config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'

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
    <div className="flex min-h-screen bg-muted/20">
      {/* --- SIDEBAR GAUCHE --- */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Pounce Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <AdminLink
            href="/admin/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Vue d'ensemble"
          />
          <AdminLink
            href="/admin/users"
            icon={<Users size={18} />}
            label="Utilisateurs"
          />
          <AdminLink
            href="/admin/settings"
            icon={<Settings size={18} />}
            label="Paramètres"
          />
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </div>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}

function AdminLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {icon}
      {label}
    </Link>
  )
}
