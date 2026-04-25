'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bebas_Neue } from 'next/font/google'
import { MapPin, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })

const RING_R = 96
const RING_C = 2 * Math.PI * RING_R

// [elapsed_ms, subtitle, headline]
const PHASES: [number, string, string][] = [
  [0, '', ''],
  [400, 'Analyse en cours', 'Voyons ça...'],
  [1600, 'Mhhh...', 'Voyons ce que\nnous avons'],
  [2900, 'Un vrai', 'Pouncer\ncelui-là !'],
  [4100, '', ''],
  [5600, 'Continue de marquer', 'ton empreinte'],
]

// [angle°, px_dist, size_px, delay_s]
const SPARKS = [
  [0, 115, 7, 0],
  [30, 128, 5, 0.06],
  [60, 110, 8, 0.02],
  [90, 132, 5, 0.09],
  [120, 118, 7, 0.04],
  [150, 124, 4, 0.12],
  [180, 112, 7, 0.01],
  [210, 130, 5, 0.08],
  [240, 116, 8, 0.05],
  [270, 126, 4, 0.1],
  [300, 110, 6, 0.03],
  [330, 136, 5, 0.07],
] as const

type Props = {
  open: boolean
  trackTitles: string[]
  challengeTitles: string[]
  onClose: () => void
  onViewed: () => Promise<void>
}

export function CertificationCelebration({
  open,
  trackTitles,
  challengeTitles,
  onClose,
  onViewed,
}: Props) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [visibleCerts, setVisibleCerts] = useState(0)
  const [canClose, setCanClose] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const certsLengthRef = useRef(trackTitles.length + challengeTitles.length)

  const allCerts = [
    ...trackTitles.map((t) => ({ title: t, type: 'track' as const })),
    ...challengeTitles.map((c) => ({ title: c, type: 'challenge' as const })),
  ]

  // Tension curve: fast → slow → burst
  const getProgress = (elapsed: number) => {
    if (elapsed < 1800) return (elapsed / 1800) * 62
    if (elapsed < 3800) return 62 + ((elapsed - 1800) / 2000) * 34
    if (elapsed < 4200) return 96 + ((elapsed - 3800) / 400) * 4
    return 100
  }

  useEffect(() => {
    if (!open) {
      setProgress(0)
      setPhase(0)
      setIsComplete(false)
      setVisibleCerts(0)
      setCanClose(false)
      setIsClosing(false)
      startRef.current = null
      completedRef.current = false
      return
    }

    certsLengthRef.current = trackTitles.length + challengeTitles.length
    const certsLen = certsLengthRef.current

    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current

      const p = Math.min(100, Math.round(getProgress(elapsed)))
      setProgress(p)

      let ph = 0
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (elapsed >= PHASES[i][0]) {
          ph = i
          break
        }
      }
      setPhase(ph)

      if (p >= 100 && !completedRef.current) {
        completedRef.current = true
        setIsComplete(true)
      }

      if (elapsed >= PHASES[4][0]) {
        const since = elapsed - PHASES[4][0]
        setVisibleCerts(Math.min(Math.floor(since / 480) + 1, certsLen))
      }

      const closeAt = PHASES[4][0] + certsLen * 480 + 1400
      if (elapsed >= closeAt) setCanClose(true)

      if (elapsed < 12000) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [open, trackTitles.length, challengeTitles.length])

  const handleClose = useCallback(async () => {
    setIsClosing(true)
    setIsPending(true)
    try {
      await onViewed()
    } finally {
      setIsPending(false)
      setTimeout(onClose, 320)
    }
  }, [onClose, onViewed])

  if (!open) return null

  const dashOffset = RING_C * (1 - progress / 100)
  const [, subtitle, headline] = PHASES[phase] ?? PHASES[0]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pb-6 sm:pb-4
        backdrop-blur-sm
        transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Card */}
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden"
        style={{
          boxShadow:
            '0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)',
          animation: isClosing
            ? undefined
            : 'cc-card-in 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-primary" />

        <div className="p-6 flex flex-col items-center">
          {/* ── Medal ring ── */}
          <div
            className="relative flex items-center justify-center mb-5"
            style={{ width: 216, height: 216 }}
          >
            {/* Pulse glow at completion */}
            {isComplete && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none bg-primary/5"
                style={{ animation: 'cc-pulse 2s ease-in-out infinite' }}
              />
            )}

            {/* SVG progress ring */}
            <svg
              width="216"
              height="216"
              viewBox="0 0 216 216"
              className="absolute inset-0"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Track */}
              <circle
                cx="108"
                cy="108"
                r={RING_R}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-border"
              />
              {/* Tick marks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i / 60) * 2 * Math.PI - Math.PI / 2
                const isMajor = i % 5 === 0
                const inner = RING_R - 4
                const outer = RING_R + (isMajor ? 5 : 2)
                return (
                  <line
                    key={i}
                    x1={108 + inner * Math.cos(a)}
                    y1={108 + inner * Math.sin(a)}
                    x2={108 + outer * Math.cos(a)}
                    y2={108 + outer * Math.sin(a)}
                    stroke="currentColor"
                    strokeWidth="1"
                    className={isMajor ? 'text-border' : 'text-border/40'}
                  />
                )
              })}
              {/* Progress arc */}
              <circle
                cx="108"
                cy="108"
                r={RING_R}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={dashOffset}
                className="text-foreground"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>

            {/* % label */}
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground tabular-nums">
              {progress}%
            </span>

            {/* Explosion sparks */}
            {isComplete &&
              SPARKS.map(([angleDeg, dist, size, delay], i) => {
                const rad = ((angleDeg as number) - 90) * (Math.PI / 180)
                const tx = (Math.cos(rad) * (dist as number)).toFixed(1)
                const ty = (Math.sin(rad) * (dist as number)).toFixed(1)
                return (
                  <div
                    key={i}
                    className="absolute rounded-full pointer-events-none bg-foreground"
                    style={
                      {
                        width: size as number,
                        height: size as number,
                        '--tx': `${tx}px`,
                        '--ty': `${ty}px`,
                        animation: `cc-spark 0.7s cubic-bezier(0.2,0.8,0.4,1) ${delay as number}s both`,
                      } as React.CSSProperties
                    }
                  />
                )
              })}

            {/* ── Spinning medal ── */}
            <div style={{ perspective: '600px' }}>
              <div
                className="relative flex items-center justify-center overflow-hidden rounded-full"
                style={{
                  width: 128,
                  height: 128,
                  animation: isComplete
                    ? 'cc-medal-spin 2s linear infinite'
                    : 'cc-medal-spin 4.5s linear infinite',
                  background: 'var(--muted)',
                  border: '1.5px solid var(--border)',
                  boxShadow: isComplete
                    ? '0 0 20px rgba(0,0,0,0.15), inset 0 0 12px rgba(0,0,0,0.05)'
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'box-shadow 0.5s ease',
                }}
              >
                {/* Shine sweep */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(108deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)',
                    animation: 'cc-shine 3.5s ease-in-out infinite',
                  }}
                />
                {/* Paw icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={
                    isComplete ? 'text-foreground' : 'text-foreground/40'
                  }
                  style={{ transition: 'color 0.4s ease' }}
                >
                  <circle cx="11" cy="4" r="2" />
                  <circle cx="18" cy="8" r="2" />
                  <circle cx="20" cy="16" r="2" />
                  <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Phase text ── */}
          <div
            key={phase}
            className="text-center min-h-20 flex flex-col items-center justify-center mb-4"
            style={{ animation: 'cc-text-in 0.4s cubic-bezier(0.22,1,0.36,1)' }}
          >
            {subtitle && (
              <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mb-1.5">
                {subtitle}
              </p>
            )}
            {headline && (
              <h2
                className={`${bebas.className} text-5xl text-foreground tracking-wide leading-tight text-center`}
              >
                {headline.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            )}
          </div>

          {/* ── Certifications ── */}
          {phase >= 4 && allCerts.length > 0 && (
            <div className="w-full space-y-2 mb-4">
              {allCerts.slice(0, visibleCerts).map((cert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted border border-border"
                  style={{
                    animation:
                      'cc-cert-in 0.4s cubic-bezier(0.22,1,0.36,1) both',
                    animationDelay: `${i * 0.07}s`,
                  }}
                >
                  <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                    {cert.type === 'challenge' ? (
                      <Trophy className="w-3.5 h-3.5 text-foreground" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                      {cert.type === 'challenge' ? 'Challenge' : 'Parcours'}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {cert.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Final tagline ── */}
          {phase >= 5 && (
            <p
              className={`${bebas.className} text-xl text-foreground tracking-[0.18em] text-center mb-4`}
              style={{
                animation: 'cc-text-in 0.5s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              CONTINUE DE MARQUER TON EMPREINTE
            </p>
          )}

          {/* ── Close button ── */}
          {canClose && (
            <Button
              onClick={handleClose}
              disabled={isPending}
              className="rounded-full w-full"
              style={{
                animation: 'cc-text-in 0.4s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {isPending ? 'Un instant...' : 'Continuer →'}
            </Button>
          )}

          {/* ── Skip ── */}
          {!canClose && phase >= 1 && (
            <button
              onClick={handleClose}
              disabled={isPending}
              className="text-muted-foreground/50 hover:text-muted-foreground text-xs tracking-wider transition-colors mt-1"
            >
              passer
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cc-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes cc-medal-spin {
          from { transform: perspective(600px) rotateY(0deg); }
          to   { transform: perspective(600px) rotateY(360deg); }
        }
        @keyframes cc-shine {
          0%, 65%  { transform: translateX(-140%); opacity: 0; }
          72%      { opacity: 1; }
          100%     { transform: translateX(200%); opacity: 0; }
        }
        @keyframes cc-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes cc-text-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes cc-cert-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cc-spark {
          0%   { transform: translate(0, 0) scale(1.3); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
