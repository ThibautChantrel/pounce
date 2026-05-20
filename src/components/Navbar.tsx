import { PawPrint } from 'lucide-react'
import { Button } from './ui/button'
import { auth } from '@/server/modules/auth/auth.config'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'
import AuthModal from './authModal'
import UserMenu from './UserMenu'
import { cn } from '@/lib/utils'

interface NavbarProps {
  showConnexionStatus?: boolean
  sticky?: boolean
}

export default async function Navbar({
  showConnexionStatus = false,
  sticky = false,
}: NavbarProps) {
  const t = await getTranslations('Navbar')
  const session = await auth()

  return (
    <nav
      className={cn(
        'w-full z-50 flex items-center justify-between px-6 py-4',
        sticky
          ? 'bg-background text-foreground'
          : 'absolute top-0 left-0 bg-transparent text-secondary'
      )}
    >
      {/* LEFT: Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <PawPrint className="w-7 h-7" />
        <span className="text-xl font-bold tracking-tight">{t('brand')}</span>
      </Link>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <Link href="/about">
          <Button variant="ghost">{t('about')}</Button>
        </Link>

        {showConnexionStatus && (
          <>
            {session ? (
              <UserMenu
                userId={session.user.id}
                firstName={session.user.firstName}
                lastName={session.user.lastName}
                pseudo={session.user.pseudo}
                email={session.user.email ?? ''}
                isAdmin={session.user.role === 'ADMIN'}
              />
            ) : (
              <AuthModal
                trigger={<Button variant="primary">{t('authButton')}</Button>}
              />
            )}
          </>
        )}
      </div>
    </nav>
  )
}
