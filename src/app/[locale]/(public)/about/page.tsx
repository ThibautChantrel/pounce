'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchChallengesForUser } from '@/actions/challenge/challenge.action'

export default function AboutPage() {
  const t = useTranslations('About')

  // 1. On stocke le lien du challenge dans un state
  const [challengeMetro, setChallengeMetro] = useState<{
    imageid: string | null
    href: string
  } | null>(null)

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const res = await fetchChallengesForUser(0, 1, 'Metro Parisien')
        if (res?.data?.[0]) {
          const challengeParis = res.data[0]
          setChallengeMetro({
            imageid: challengeParis.coverId,
            href: `/challenges/${challengeParis.id}`,
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du challenge:', error)
      }
    }

    loadChallenge()
  }, [])

  const metroLink = challengeMetro?.href || '#'

  return (
    <div className="flex flex-col">
      {/* ================= HERO FULLSCREEN ================= */}
      <section className="relative min-h-screen w-full flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/about.png"
            alt="Mountain trail"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative z-10 max-w-2xl px-5 sm:px-6 text-white">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight leading-tight mb-6">
            {t('hero.title')}
          </h1>

          <div className="space-y-4 sm:space-y-5 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed font-light">
            <p>{t('hero.p1')}</p>
            <p>{t('hero.p2')}</p>
            <p>{t('hero.p3')}</p>
          </div>
        </div>
      </section>

      {/* ================= ORIGIN ================= */}
      <section className="py-20 md:py-24 bg-background">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 space-y-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            {t('origin.title')}
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
            <p>{t('origin.p1')}</p>
            <p>{t('origin.p2')}</p>
            <p>{t('origin.p3')}</p>
          </div>
        </div>
      </section>

      {/* ================= GOALS ================= */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              {t('goals.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-light">
              {t('goals.subtitle')}
            </p>
          </div>

          <div className="grid gap-10 sm:gap-12 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-medium">
                {t('goals.items.tangible.title')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                {t('goals.items.tangible.desc')}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-medium">
                {t('goals.items.collection.title')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                {t('goals.items.collection.desc')}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-medium">
                {t('goals.items.wallOfFame.title')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                {t('goals.items.wallOfFame.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= METRO SECTION ================= */}
      <section className="py-20 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 grid gap-12 md:gap-16 md:grid-cols-2 items-center">
          {/* TEXT LEFT */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              {t('future.subtitle')}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
              {t('future.p1')}
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
              {t('future.p2')}
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
              {t('future.p3')}
            </p>

            {/* 3. On utilise metroLink ici */}
            {challengeMetro && (
              <Link
                href={metroLink}
                className="inline-block pt-2 text-sm font-medium underline underline-offset-4 hover:opacity-70 transition"
              >
                {t('future.cta')}
              </Link>
            )}
          </div>

          {/* IMAGE RIGHT */}
          {/* 4. Et on utilise metroLink ici aussi */}
          <Link
            href={metroLink}
            className={`relative group mx-auto md:mx-0 w-full max-w-sm sm:max-w-md md:max-w-full ${
              !challengeMetro ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <Image
              src={`/api/files/${challengeMetro?.imageid || 'about.png'}`} // Si tu as une image dynamique, tu peux faire: src={challengeMetro?.imageid ? `/chemin/${challengeMetro.imageid}` : '/about.png'}
              alt="Paris Metro Challenge"
              width={700}
              height={900}
              className="rounded-xl shadow-lg transition duration-500 group-hover:scale-[1.02]"
            />
          </Link>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 md:py-24 bg-muted/20 text-center">
        <div className="max-w-xl mx-auto px-5 sm:px-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            {t('cta.title')}
          </h2>

          <div className="space-y-3 text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
            <p>{t('cta.p1')}</p>
            <p>{t('cta.p2')}</p>
            <p>{t('cta.p3')}</p>
          </div>

          <Button size="lg" variant="secondary" asChild className="group">
            <Link href="/feedbacks">
              {t('cta.button')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
