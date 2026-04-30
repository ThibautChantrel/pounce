'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Trophy, Map, Footprints, Bike } from 'lucide-react'
import { FilterBar } from '@/components/ui/filter-bar'
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

  const rawSearch = tab === 'challenges' ? challengeSearch : trackSearch
  const activeFilter = tab === 'challenges' ? challengeFilter : trackFilter

  const setSearch = tab === 'challenges' ? setChallengeSearch : setTrackSearch
  const setFilter = tab === 'challenges' ? setChallengeFilter : setTrackFilter

  const filteredTracks = useMemo(
    () =>
      completedTracks
        .filter((cert) =>
          trackFilter === 'all'
            ? true
            : classifyType(cert.activityType) === trackFilter
        )
        .filter(
          (cert) =>
            !debouncedTrackSearch ||
            cert.track.title
              .toLowerCase()
              .includes(debouncedTrackSearch.toLowerCase())
        ),
    [completedTracks, trackFilter, debouncedTrackSearch]
  )

  const filteredChallenges = useMemo(
    () =>
      completedChallenges
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
        ),
    [completedChallenges, challengeFilter, debouncedChallengeSearch]
  )

  const filteredInProgress = useMemo(
    () =>
      inProgressChallenges.filter(
        (c) =>
          !debouncedChallengeSearch ||
          c.challenge.title
            .toLowerCase()
            .includes(debouncedChallengeSearch.toLowerCase())
      ),
    [inProgressChallenges, debouncedChallengeSearch]
  )

  const hasContent =
    completedTracks.length > 0 ||
    completedChallenges.length > 0 ||
    inProgressChallenges.length > 0

  if (!hasContent) return null

  const challengeCount =
    completedChallenges.length + inProgressChallenges.length
  const trackCount = completedTracks.length

  const TABS = [
    {
      value: 'challenges' as Tab,
      label: t('myCompletedChallenges'),
      icon: <Trophy className="w-3.5 h-3.5" />,
      count: challengeCount,
    },
    {
      value: 'tracks' as Tab,
      label: t('myCompletedTracks'),
      icon: <Map className="w-3.5 h-3.5" />,
      count: trackCount,
    },
  ]

  const FILTERS = [
    { value: 'all' as ActivityFilter, label: t('filterAll') },
    {
      value: 'run' as ActivityFilter,
      label: t('filterRun'),
      icon: <Footprints className="w-3 h-3" />,
    },
    {
      value: 'ride' as ActivityFilter,
      label: t('filterRide'),
      icon: <Bike className="w-3 h-3" />,
    },
  ]

  const summary =
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
      <FilterBar
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setFilter}
        search={rawSearch}
        onSearchChange={setSearch}
        searchPlaceholder={t('searchPlaceholder')}
        summary={summary || undefined}
      />

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
