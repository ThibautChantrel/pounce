'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Trophy, Map, X, Footprints, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CertCard } from './CertCard'
import type {
  CompletedChallenge,
  CompletedTrack,
  InProgressChallenge,
} from '@/actions/user/user.certifications.actions'

type Tab = 'challenges' | 'tracks'
type ActivityFilter = 'all' | 'run' | 'ride'

const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun', 'Hike', 'Walk'])
const RIDE_TYPES = new Set([
  'Ride',
  'GravelRide',
  'MountainBikeRide',
  'VirtualRide',
  'EBikeRide',
  'EMountainBikeRide',
  'Handcycle',
  'Velomobile',
])

function classifyType(type: string): 'run' | 'ride' | 'other' {
  if (RUN_TYPES.has(type)) return 'run'
  if (RIDE_TYPES.has(type)) return 'ride'
  return 'other'
}

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

type Props = {
  completedTracks: CompletedTrack[]
  completedChallenges: CompletedChallenge[]
  inProgressChallenges: InProgressChallenge[]
}

export function CertificationGallery({
  completedTracks,
  completedChallenges,
  inProgressChallenges,
}: Props) {
  const t = useTranslations('Profile')
  const [tab, setTab] = useState<Tab>('challenges')

  // Independent state per tab
  const [challengeSearch, setChallengeSearch] = useState('')
  const [challengeFilter, setChallengeFilter] = useState<ActivityFilter>('all')
  const [trackSearch, setTrackSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState<ActivityFilter>('all')

  const debouncedChallengeSearch = useDebounce(challengeSearch, 300)
  const debouncedTrackSearch = useDebounce(trackSearch, 300)

  const search =
    tab === 'challenges' ? debouncedChallengeSearch : debouncedTrackSearch
  const activityFilter = tab === 'challenges' ? challengeFilter : trackFilter
  const setSearch = tab === 'challenges' ? setChallengeSearch : setTrackSearch
  const setActivityFilter =
    tab === 'challenges' ? setChallengeFilter : setTrackFilter
  const rawSearch = tab === 'challenges' ? challengeSearch : trackSearch

  const filteredTracks = useMemo(() => {
    return completedTracks
      .filter((cert) => {
        if (trackFilter === 'all') return true
        return classifyType(cert.activityType) === trackFilter
      })
      .filter(
        (cert) =>
          !debouncedTrackSearch ||
          cert.track.title
            .toLowerCase()
            .includes(debouncedTrackSearch.toLowerCase())
      )
  }, [completedTracks, trackFilter, debouncedTrackSearch])

  const filteredChallenges = useMemo(() => {
    return completedChallenges
      .filter((cert) => {
        if (challengeFilter === 'all') return true
        if (challengeFilter === 'run') return cert.activityMode === 'RUN'
        if (challengeFilter === 'ride') return cert.activityMode === 'RIDE'
        return true
      })
      .filter(
        (cert) =>
          !debouncedChallengeSearch ||
          cert.challenge.title
            .toLowerCase()
            .includes(debouncedChallengeSearch.toLowerCase())
      )
  }, [completedChallenges, challengeFilter, debouncedChallengeSearch])

  const filteredInProgress = useMemo(() => {
    return inProgressChallenges.filter(
      (c) =>
        !debouncedChallengeSearch ||
        c.challenge.title
          .toLowerCase()
          .includes(debouncedChallengeSearch.toLowerCase())
    )
  }, [inProgressChallenges, debouncedChallengeSearch])

  const hasContent =
    completedTracks.length > 0 ||
    completedChallenges.length > 0 ||
    inProgressChallenges.length > 0

  if (!hasContent) return null

  const FILTERS: {
    value: ActivityFilter
    label: string
    icon?: React.ReactNode
  }[] = [
    { value: 'all', label: t('filterAll') },
    {
      value: 'run',
      label: t('filterRun'),
      icon: <Footprints className="w-3 h-3" />,
    },
    {
      value: 'ride',
      label: t('filterRide'),
      icon: <Bike className="w-3 h-3" />,
    },
  ]

  const challengeCount =
    completedChallenges.length + inProgressChallenges.length
  const trackCount = completedTracks.length

  const summaryPhrase =
    tab === 'challenges'
      ? [
          completedChallenges.length > 0 &&
            `${completedChallenges.length} défi${completedChallenges.length > 1 ? 's' : ''} certifié${completedChallenges.length > 1 ? 's' : ''}`,
          inProgressChallenges.length > 0 &&
            `${inProgressChallenges.length} en cours`,
        ]
          .filter(Boolean)
          .join(' · ')
      : trackCount > 0
        ? `${trackCount} parcours certifié${trackCount > 1 ? 's' : ''}`
        : ''

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-full p-1 flex">
          <button
            onClick={() => setTab('challenges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              tab === 'challenges'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {t('myCompletedChallenges')}
            <span className="text-[11px] tabular-nums opacity-60">
              {challengeCount}
            </span>
          </button>
          <button
            onClick={() => setTab('tracks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              tab === 'tracks'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            {t('myCompletedTracks')}
            <span className="text-[11px] tabular-nums opacity-60">
              {trackCount}
            </span>
          </button>
        </div>
      </div>

      {/* Summary phrase */}
      {summaryPhrase && (
        <p className="text-center text-muted-foreground text-sm">
          {summaryPhrase}
        </p>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={rawSearch}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-background/50 backdrop-blur-sm"
          />
          {rawSearch && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              variant="ghost"
              onClick={() => setActivityFilter(f.value)}
              className={cn(
                'h-auto rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                activityFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                  : 'bg-background/50 text-muted-foreground border-border hover:bg-background/50 hover:border-primary/50 hover:text-foreground'
              )}
            >
              {f.icon}
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {tab === 'challenges' && (
        <>
          {filteredInProgress.length === 0 &&
          filteredChallenges.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-12">
              {t('noResults')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredInProgress.map(({ challenge, completedCount }) => (
                <CertCard
                  key={challenge.id}
                  type="inProgress"
                  data={{ challenge, completedCount }}
                />
              ))}
              {filteredChallenges.map((cert) => (
                <CertCard key={cert.id} type="challenge" data={cert} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'tracks' && (
        <>
          {filteredTracks.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-12">
              {t('noResults')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTracks.map((cert) => (
                <CertCard key={cert.id} type="track" data={cert} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
