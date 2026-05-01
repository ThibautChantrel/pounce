'use client'

import Image from 'next/image'
import { Link } from '@/navigation'
import {
  MapPin,
  Timer,
  Zap,
  Mountain,
  Trophy,
  TrendingUp,
  Footprints,
  Bike,
} from 'lucide-react'
import type {
  CompletedChallenge,
  CompletedTrack,
  InProgressChallenge,
} from '@/actions/user/user.certifications.actions'

export type CertCardProps =
  | { type: 'track'; data: CompletedTrack }
  | { type: 'challenge'; data: CompletedChallenge }
  | { type: 'inProgress'; data: InProgressChallenge }

const ACTIVITY_LABELS: Record<string, string> = {
  Run: 'Course',
  TrailRun: 'Trail',
  VirtualRun: 'Run virtuel',
  Hike: 'Randonnée',
  Walk: 'Marche',
  Ride: 'Vélo',
  GravelRide: 'Gravel',
  MountainBikeRide: 'VTT',
  VirtualRide: 'Vélo virtuel',
  EBikeRide: 'VAE',
  EMountainBikeRide: 'VTTAE',
}

const MODE_LABELS: Record<string, string> = {
  RUN: 'Course',
  RIDE: 'Vélo',
  HYBRID: 'Mixte',
  OTHER: '',
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  RUN: <Footprints className="w-3 h-3" />,
  RIDE: <Bike className="w-3 h-3" />,
  HYBRID: <TrendingUp className="w-3 h-3" />,
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
}

export function CertCard(props: CertCardProps) {
  const isTrack = props.type === 'track'
  const isInProgress = props.type === 'inProgress'

  const challengeData = isInProgress
    ? props.data.challenge
    : !isTrack
      ? (props.data as CompletedChallenge).challenge
      : null
  const trackData = isTrack ? (props.data as CompletedTrack).track : null

  const href = isTrack
    ? `/tracks/${trackData!.id}`
    : `/challenges/${challengeData!.id}`
  const title = isTrack ? trackData!.title : challengeData!.title
  const coverId = isTrack ? trackData!.coverId : challengeData!.coverId
  const imageUrl = coverId ? `/api/files/${coverId}` : null

  const completedAt = !isInProgress
    ? (props.data as CompletedChallenge | CompletedTrack).completedAt
    : null
  const dateStr = completedAt
    ? new Date(completedAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null

  const pct = isInProgress
    ? Math.round(
        (props.data.completedCount / props.data.challenge.totalTracks) * 100
      )
    : 100

  return (
    <Link
      href={href}
      className="group relative flex flex-col aspect-[5/4] rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Background image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Subtle overall dark vignette for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Top gradient + info */}
      <div className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-black/75 via-black/25 to-transparent p-3 z-10 flex flex-col">
        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow-sm">
          {title}
        </h3>
        {challengeData && (
          <p className="text-white/70 text-[11px] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            {challengeData.location}
          </p>
        )}
        {dateStr && (
          <p className="text-white/55 text-[11px] mt-auto">{dateStr}</p>
        )}
        {isInProgress && (
          <p className="text-white/55 text-[11px] mt-auto">En cours</p>
        )}
      </div>

      {/* Bottom gradient + stats */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3 z-10 flex flex-col justify-end gap-1.5">
        {isTrack && (
          <>
            <div className="flex items-center gap-3 text-white/90 text-[11px] font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {(props.data as CompletedTrack).distance.toFixed(1)} km
              </span>
              {(props.data as CompletedTrack).elevationGain > 0 && (
                <span className="flex items-center gap-1.5">
                  <Mountain className="w-3 h-3 shrink-0" />
                  {Math.round((props.data as CompletedTrack).elevationGain)} m
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-white/65 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 shrink-0" />
                {(props.data as CompletedTrack).avgSpeed.toFixed(1)} km/h
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="w-3 h-3 shrink-0" />
                {formatTime((props.data as CompletedTrack).totalTime)}
              </span>
            </div>
          </>
        )}
        {!isTrack && !isInProgress && (
          <div className="flex items-center gap-3 text-white/90 text-[11px] font-medium">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3 h-3 shrink-0" />
              {(props.data as CompletedChallenge).challenge.trackCount} parcours
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 shrink-0" />
              {(
                props.data as CompletedChallenge
              ).challenge.totalDistance.toFixed(0)}{' '}
              km
            </span>
          </div>
        )}
        {isInProgress && (
          <>
            <div className="flex items-center justify-between text-white/65 text-[10px] uppercase tracking-widest mb-0.5">
              <span>Progression</span>
              <span>
                {props.data.completedCount}/{props.data.challenge.totalTracks}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/80 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Activity badge */}
      {isTrack &&
        ACTIVITY_LABELS[(props.data as CompletedTrack).activityType] && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-black/30 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/15">
            {ACTIVITY_LABELS[(props.data as CompletedTrack).activityType]}
          </div>
        )}
      {!isTrack &&
        !isInProgress &&
        MODE_LABELS[(props.data as CompletedChallenge).activityMode] && (
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/15">
            {MODE_ICONS[(props.data as CompletedChallenge).activityMode]}
            {MODE_LABELS[(props.data as CompletedChallenge).activityMode]}
          </div>
        )}
      {isInProgress && (
        <div className="absolute top-2.5 right-2.5 z-10 bg-black/30 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/15">
          {pct}%
        </div>
      )}
    </Link>
  )
}
