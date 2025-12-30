import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { Button } from './ui/button'
import AuthModal from './authModal'
import { auth, signOut } from '@/server/modules/auth/auth.config'
import { getTranslations } from 'next-intl/server'

export default async function Navbar() {
  const t = await getTranslations('Navbar')
  const session = await auth()

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-2 bg-transparent text-clay">
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <PawPrint className="w-8 h-8" />
        <span className="text-xl font-bold tracking-tight">{t('brand')}</span>
      </Link>

      <div>
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {session.user?.name || session.user?.email}
            </span>

            <form
              action={async () => {
                'use server'
                await signOut()
              }}
            >
              <Button variant="ghost" type="submit">
                {t('logoutButton')}
              </Button>
            </form>
          </div>
        ) : (
          <AuthModal
            trigger={<Button variant="canopy">{t('authButton')}</Button>}
          />
        )}
      </div>
    </nav>
  )
}
