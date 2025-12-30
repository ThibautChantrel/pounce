import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PawPrint } from 'lucide-react'
import { Button } from './ui/button'
import { Modal } from './ui/custom/modal'
import AuthModal from './authModal'

export default function Navbar() {
  const t = useTranslations('Navbar')

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-2 bg-transparent text-clay">
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <PawPrint className="w-8 h-8" />
        <span className="text-xl font-bold tracking-tight">{t('brand')}</span>
      </Link>

      <div className="flex items-center gap-4">
        <AuthModal
          trigger={<Button variant="canopy">{t('authButton')}</Button>}
        />
      </div>
    </nav>
  )
}
