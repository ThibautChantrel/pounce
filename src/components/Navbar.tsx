import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PawPrint } from 'lucide-react'
import { Button } from './ui/button'
import { Modal } from './ui/custom/modal'

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
        <Modal
          title={t('loginModalTitle')}
          description={t('loginModalDesc')}
          trigger={<Button variant="canopy">{t('authButton')}</Button>}
        >
          {/* CONTENU DE LA MODALE */}
          {/* Pour l'instant on met un texte simple, bientôt votre formulaire */}
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-500">
              Le formulaire de connexion sera ici.
            </p>
            {/* Exemple visuel */}
            <div className="flex flex-col gap-2">
              <input className="border p-2 rounded" placeholder="Email" />
              <input
                className="border p-2 rounded"
                type="password"
                placeholder="Mot de passe"
              />
              <Button>Valider</Button>
            </div>
          </div>
        </Modal>
      </div>
    </nav>
  )
}
