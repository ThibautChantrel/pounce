'use client'

import { ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'

export default function Hero() {
  const t = useTranslations('Hero')
  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    })
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg"
      />

      <div className="absolute inset-0 bg-black/60 z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-6 space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
          {t('title.line1')}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-gray-200 to-gray-400">
            {t('title.highlight')}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
          {t('description')}
        </p>

        <Button size="lg" variant="secondary" asChild>
          <Link href="/feedbacks">
            {t('cta')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>

        <p className="text-sm text-white/70">{t('badge')}</p>
      </div>

      <button
        onClick={scrollToNextSection}
        aria-label="Scroll vers la section suivante"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce"
      >
        <ChevronDown className="text-white/80 w-10 h-10 hover:text-white transition-colors" />
      </button>
    </section>
  )
}
