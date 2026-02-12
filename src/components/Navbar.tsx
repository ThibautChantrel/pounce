import { PawPrint } from 'lucide-react'
import { Button } from './ui/button'
import { auth } from '@/server/modules/auth/auth.config'
import { getTranslations } from 'next-intl/server'
import LogoutButton from './LogoutButton'
import { Settings } from 'lucide-react'
import { Link } from '@/navigation'
import AuthModal from './authModal'

export default async function Navbar({ showConnexionStatus = false }) {
  const t = await getTranslations('Navbar')
  const session = await auth()

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-2 bg-transparent text-secondary">
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <PawPrint className="w-8 h-8" />
        <span className="text-xl font-bold tracking-tight">{t('brand')}</span>
      </Link>
      {showConnexionStatus && (
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {session.user?.name || session.user?.email}
              </span>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="ghost">
                    <Settings className="w-8 h-8" />
                  </Button>
                </Link>
              )}
              <LogoutButton />
            </div>
          ) : (
            <AuthModal
              trigger={<Button variant="primary">{t('authButton')}</Button>}
            />
          )}
        </div>
      )}
    </nav>
  )
}
