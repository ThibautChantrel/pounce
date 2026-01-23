import { Link } from '@/navigation'
import { getTranslations } from 'next-intl/server'
import { Map, Mountain, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ChallengeTrack } from '@/actions/challenge/challenge.admin.type'
import { Track } from '@/actions/track/track.admin.types'

type TrackWithRelation = ChallengeTrack & { track: Track }

interface ChallengeTrackListProps {
  tracks: TrackWithRelation[]
}

export async function ChallengeTrackList({ tracks }: ChallengeTrackListProps) {
  const t = await getTranslations('Challenges.ChallengeDetail')

  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-canopy text-clay text-sm font-bold">
          {sortedTracks.length}
        </span>
        {t('tracksTitle')}
      </h2>

      <div className="grid gap-4">
        {sortedTracks.map((item, index) => (
          <Link
            key={item.id}
            href={`/tracks/${item.track.id}`}
            className="group"
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-canopy/50 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900">
              <div className="flex flex-col md:flex-row md:items-center">
                {/* Numéro de l'étape */}
                <div className="bg-zinc-100 dark:bg-zinc-800 w-full md:w-24 flex items-center justify-center py-4 md:py-0 md:self-stretch border-b md:border-b-0 md:border-r">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                      {t('stage')}
                    </span>
                    <span className="text-3xl font-heading font-black text-zinc-300 group-hover:text-canopy transition-colors">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-canopy transition-colors mb-1">
                      {item.track.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.track.description || t('noTrackDescription')}
                    </p>
                  </div>

                  {/* Stats du track */}
                  <div className="flex items-center gap-4 md:gap-8 text-sm">
                    <div
                      className="flex items-center gap-1.5"
                      title={t('distance')}
                    >
                      <Map className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-medium">
                        {item.track.distance} km
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1.5"
                      title={t('elevation')}
                    >
                      <Mountain className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-medium">
                        {item.track.elevationGain || 0} m
                      </span>
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
