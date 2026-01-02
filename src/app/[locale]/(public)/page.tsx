'use client'
import AuthModal from '@/components/authModal'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export default function Home() {
  const t = useTranslations('Navbar')

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Hero />

      {/* 2. RESTE DU CONTENU (Apparaît au scroll) */}
      {/* J'ai regroupé vos boutons dans une div pour que ce soit propre */}
      <div className="flex flex-col items-center gap-6 py-24 px-4">
        <h2 className="text-2xl font-bold">Zone de composants (Scroll)</h2>

        {/* Grille de boutons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="secondary">Hello World</Button>
          <div className="bg-canopy text-clay px-4 py-2 rounded">
            Test couleur
          </div>
          <Button variant="canopy">Action principale</Button>
          <Button variant="sienna">Action secondaire</Button>
          <Button variant="slate">Confirmer</Button>
          <Button variant="clay">Annuler</Button>
          <Button variant="outline">Outline</Button>
          <Button
            variant="ghost"
            onClick={() =>
              toast('Event has been created', {
                description: 'Sunday, December 03, 2023 at 9:00 AM',
                action: {
                  label: 'Undo',
                  onClick: () => console.log('Undo'),
                },
              })
            }
          >
            {t('authButton')}
          </Button>
        </div>

        <AuthModal
          trigger={<Button variant="canopy">{t('authButton')}</Button>}
        />
      </div>
    </main>
  )
}
