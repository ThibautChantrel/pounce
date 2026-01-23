'use client'
import AuthModal from '@/components/AuthModal'
import { ChallengeCarousel } from '@/components/ChallengeCaroussel'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('Navbar')

  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Hero />

      <div className="flex flex-col items-center gap-6 py-24 px-4">
        <ChallengeCarousel />

        <AuthModal
          trigger={<Button variant="canopy">{t('authButton')}</Button>}
        />
      </div>
    </main>
  )
}
