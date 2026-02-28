'use client'

import { useState } from 'react'
import { Sparkles, Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { TrackCard } from '../track/TrackCard'

// 1. IMPORT DES VRAIS TYPES (supprime tes types manuels)
import { ChallengeTrack } from '@/actions/challenge/challenge.admin.type'
import { Track } from '@/actions/track/track.types'
import { useTranslations } from 'next-intl' // 2. IMPORT POUR LA TRADUCTION

type TrackWithRelation = ChallengeTrack & { track: Track }

type MagicSelectProps = {
  tracks: TrackWithRelation[]
}

export function MagicSelect({ tracks }: MagicSelectProps) {
  // 3. INITIALISATION DE LA TRADUCTION (Ajuste le namespace selon ton fichier json)
  const t = useTranslations('Challenges.ChallengeDetail.MagicSelect')
  const tChallengeDetail = useTranslations('Challenges.ChallengeDetail')

  const phrases = t.raw('phrases') as string[]

  const [isSelecting, setIsSelecting] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [tempTrackName, setTempTrackName] = useState('')

  // On stocke l'objet complet ET son vrai index pour l'affichage
  const [selectedResult, setSelectedResult] = useState<{
    track: TrackWithRelation
    index: number
  } | null>(null)

  const [glow, setGlow] = useState(false)

  const handleMagicSelect = () => {
    if (tracks.length === 0 || isSelecting) return

    setIsSelecting(true)
    setSelectedResult(null)
    setGlow(false)
    setCurrentText(phrases[0])

    let ticks = 0
    const maxTicks = 28
    let delay = 70

    const run = () => {
      ticks++

      const randomItem = tracks[Math.floor(Math.random() * tracks.length)]

      setTempTrackName(randomItem.track.title || 'Parcours mystère')

      if (ticks % 5 === 0) {
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
        setCurrentText(randomPhrase)
      }

      if (ticks < maxTicks) {
        delay += 8
        setTimeout(run, delay)
      } else {
        const finalIndex = Math.floor(Math.random() * tracks.length)
        const finalWinner = tracks[finalIndex]

        setSelectedResult({ track: finalWinner, index: finalIndex })
        setCurrentText(t('winner'))
        setTempTrackName('')
        setIsSelecting(false)

        setTimeout(() => setGlow(true), 150)
      }
    }

    run()
  }

  if (tracks.length <= 1) return null

  return (
    <div className="relative mb-12 overflow-hidden rounded-2xl border border-border/40 bg-linear-to-br from-background to-muted/30 backdrop-blur-xl p-8 text-center">
      {isSelecting && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
      )}

      <div className="relative space-y-6">
        {!isSelecting && !selectedResult && (
          <div className="space-y-3">
            <h3 className="font-semibold text-xl tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('title')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t('subtitle')}
            </p>
          </div>
        )}

        {(isSelecting || selectedResult) && (
          // Attention: `min-h-27.5` n'est pas une classe Tailwind standard. Utilise plutôt `min-h-[110px]` ou `min-h-28`
          <div className="min-h-27.5 flex flex-col items-center justify-center transition-all duration-300">
            <p className="text-sm text-muted-foreground italic tracking-wide">
              {currentText}
            </p>

            {isSelecting && (
              <p className="mt-4 text-2xl font-semibold tracking-tight transition-all duration-200">
                {tempTrackName}
              </p>
            )}

            {/* 5. PASSAGE DES BONNES PROPS À LA TRACKCARD */}
            {selectedResult && !isSelecting && (
              <div
                className={clsx(
                  'w-full text-left mt-4 transition-all duration-1000',
                  glow ? 'scale-[1.02] opacity-100' : 'scale-100 opacity-0'
                )}
              >
                <div className="relative">
                  {/* L'EFFET DE GLOW RÉEL ICI */}
                  {glow && (
                    <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-2xl animate-in fade-in duration-1000 -z-10" />
                  )}

                  <TrackCard
                    key={selectedResult.track.id}
                    item={selectedResult.track}
                    index={selectedResult.index}
                    t={tChallengeDetail}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleMagicSelect}
          disabled={isSelecting}
          size="lg"
          className="px-8"
        >
          <Dices
            className={clsx(
              'mr-2 w-4 h-4 transition-transform duration-300',
              // Attention: `spin-smooth` doit être défini dans ton global.css, sinon utilise `animate-spin`
              isSelecting && 'animate-spin scale-110'
            )}
          />
          {isSelecting
            ? t('searching')
            : selectedResult
              ? t('ctaRetry')
              : t('ctaDefault')}
        </Button>
      </div>
    </div>
  )
}
