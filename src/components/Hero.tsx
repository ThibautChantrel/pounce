'use client'

import { ChevronDown, ArrowRight } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'

export default function Hero() {
  const t = useTranslations('Hero')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true
      videoRef.current.muted = true
      videoRef.current.play().catch((error) => {
        console.log("L'autoplay a été bloqué par le navigateur :", error)
      })
    }
  }, [])

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    })
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true" // Obligatoire pour les anciens Safari iOS
        preload="auto"
        // On ajoute poster="/hero-poster.jpg" ici si tu as une image de secours
      />

      {/* Overlay pour assombrir la vidéo et rendre le texte lisible */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-6 space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
          {t('title.line1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
            {t('title.highlight')}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
          {t('description')}
        </p>

        <div className="flex flex-col items-center gap-4">
          <Button size="lg" variant="secondary" asChild className="group">
            <Link href="/feedbacks">
              {t('cta')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <p className="text-sm text-gray-300 font-medium">{t('badge')}</p>
        </div>
      </div>

      {/* Bouton Scroll vers le bas */}
      <button
        onClick={scrollToNextSection}
        aria-label="Scroll vers la section suivante"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer"
      >
        <ChevronDown className="text-white/80 w-10 h-10 hover:text-white transition-colors" />
      </button>
    </section>
  )
}
