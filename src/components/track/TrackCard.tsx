import Image from 'next/image'
import { Link } from '@/navigation'
import { Map, Mountain, ArrowRight, ImageOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ChallengeTrack } from '@/actions/challenge/challenge.admin.type'
import { Track } from '@/actions/track/track.types'

type TrackWithRelation = ChallengeTrack & { track: Track }

interface TrackCardProps {
  item: TrackWithRelation
  index: number
  t: (key: string) => string
}

export function TrackCard({ item, index, t }: TrackCardProps) {
  const coverId = item.track.coverId

  return (
    <Link href={`/tracks/${item.track.id}`} className="group block h-full">
      <Card className="h-full p-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-canopy/50 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-stretch h-full">
          {/* --- BLOC IMAGE --- */}
          <div className="shrink-0 md:w-32 dark:bg-zinc-800 border-b md:border-b-0 md:border-r flex items-center justify-center">
            <div className="relative h-40 w-full p-4 md:p-0 md:h-full md:w-full">
              <div className="relative w-full h-full md:w-full md:h-full overflow-hidden rounded-lg md:rounded-none shadow-sm md:shadow-none bg-clay dark:bg-zinc-700 flex items-center justify-center">
                {coverId ? (
                  <Image
                    src={`/api/files/${coverId}`}
                    alt={item.track.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 128px"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                    <ImageOff className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-widest opacity-70">
                      No Image
                    </span>
                  </div>
                )}

                <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-[2px] text-white px-2 py-1 rounded-br-lg text-[10px] font-bold uppercase tracking-wider z-10">
                  #{index + 1}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h3 className="text-lg font-bold group-hover:text-canopy transition-colors mb-1 truncate">
                {item.track.title}
              </h3>

              {/* 4. CALIBRAGE DU TEXTE :
                  - text-sm leading-relaxed : La hauteur de ligne est d'environ 1.25rem (20px).
                  - min-h-[2.5rem] : On force une hauteur minimale de 2.5rem (40px), 
                    ce qui correspond exactement à 2 lignes.
                  - line-clamp-2 : Coupe si ça dépasse 2 lignes.
              */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-10">
                {item.track.description || t('noTrackDescription')}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm shrink-0 mt-2 md:mt-0">
              <div className="flex items-center gap-1.5" title={t('distance')}>
                <Map className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono font-medium text-xs md:text-sm">
                  {item.track.distance} km
                </span>
              </div>
              <div className="flex items-center gap-1.5" title={t('elevation')}>
                <Mountain className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono font-medium text-xs md:text-sm">
                  {item.track.elevationGain || 0} m
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
