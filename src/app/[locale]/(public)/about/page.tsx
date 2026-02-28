'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchChallengesForUser } from '@/actions/challenge/challenge.action'
import { ChallengeCard } from '@/components/challenge/ChallengeCard'
import { ChallengeWithRelations } from '@/actions/challenge/challenge.admin.type'

export default function AboutPage() {
  const t = useTranslations('About')
  const tGlobal = useTranslations('')

  const [challengeMetro, setChallengeMetro] =
    useState<ChallengeWithRelations | null>(null)

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const res = await fetchChallengesForUser(0, 1, 'Metro Parisien')
        if (res?.data?.[0]) {
          const challengeParis = res.data[0]
          setChallengeMetro(challengeParis)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du challenge:', error)
      }
    }

    loadChallenge()
  }, [])

  const metroLink = challengeMetro ? `/challenges/${challengeMetro.id}` : '#'

  return (
    <div className="flex flex-col">
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col">
        {/* IMAGE & OVERLAYS */}
        <div className="absolute inset-0">
          <Image
            src="/about.png"
            alt="Mountain trail"
            fill
            priority
            className="object-cover animate-in zoom-in-[1.03] duration-2000 ease-out"
            // ^ Un très léger zoom arrière au chargement pour le dynamisme
          />
          {/* Dégradé optimisé : Assombrit le bas sur mobile, et la gauche sur desktop */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10 md:bg-linear-to-r md:from-black/80 md:via-black/40 md:to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 md:py-32 grow flex items-center">
          <div className="max-w-2xl text-white">
            {/* Eyebrow */}
            <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {tGlobal('Navbar.brand')}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
              {t('hero.title')}
            </h1>

            {/* Ligne séparatrice élégante */}
            <div className="h-px w-12 bg-white/30 mb-8 animate-in fade-in zoom-in duration-700 delay-300 fill-mode-both" />

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
              {/* Le premier paragraphe ressort plus (texte un peu plus grand et plus blanc) */}
              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed font-light">
                {t('hero.p1')}
              </p>

              {/* Les suivants sont plus discrets */}
              <div className="space-y-4 text-sm sm:text-base text-white/60 leading-relaxed font-light">
                <p>{t('hero.p2')}</p>
                <p>{t('hero.p3')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="relative z-10 w-full flex justify-center pb-8 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <ChevronDown className="w-5 h-5 animate-bounce" />
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
          {challengeMetro && <ChallengeCard challenge={challengeMetro} />}
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
