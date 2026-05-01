import { getTranslations } from 'next-intl/server'
import { ChallengeTrack } from '@/actions/challenge/challenge.admin.type'
import { Track } from '@/actions/track/track.types'
import { TrackCard } from '../track/TrackCard'

type TrackWithRelation = ChallengeTrack & { track: Track }

interface ChallengeTrackListProps {
  tracks: TrackWithRelation[]
  certifiedTrackIds?: string[]
}

export async function ChallengeTrackList({
  tracks,
  certifiedTrackIds,
}: ChallengeTrackListProps) {
  const t = await getTranslations('Challenges.ChallengeDetail')
  const certifiedSet = new Set(certifiedTrackIds ?? [])

  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-secondary text-sm font-bold">
          {sortedTracks.length}
        </span>
        {t('tracksTitle')}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
        {sortedTracks.map((item, index) => (
          <TrackCard
            key={item.id}
            item={item}
            index={index}
            isCertified={certifiedSet.has(item.trackId)}
            t={t}
          />
        ))}
      </div>
    </div>
  )
}
