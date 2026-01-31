import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { MapPin, Map, Mountain, Trophy, Calendar } from 'lucide-react'
import { Difficulty } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import { fileWithoutData } from '@/server/modules/file/file.types'
import { getDifficultyColor } from '@/utils/colors'

interface ChallengeHeaderProps {
  title: string
  location: string
  difficulty: Difficulty
  banner: fileWithoutData | null
  cover: fileWithoutData | null
  totalDistance: number
  totalElevation: number
  tracksCount: number
  createdAt: Date
}

export async function ChallengeHeader({
  title,
  location,
  difficulty,
  banner,
  cover,
  totalDistance,
  totalElevation,
  tracksCount,
  createdAt,
}: ChallengeHeaderProps) {
  const t = await getTranslations('Challenges.ChallengeDetail')

  const bannerUrl = banner
    ? `/api/files/${banner.id}`
    : '/images/placeholder-banner.jpg'
  const coverUrl = cover
    ? `/api/files/${cover.id}`
    : '/images/placeholder-cover.jpg'

  // Formatage de la date (court)
  const dateStr = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
          src={bannerUrl}
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      {/* HEADER & INFO (Overlap) */}
      <div className="container max-w-5xl mx-auto px-4">
        <div className="relative -mt-20 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* COVER IMAGE (Avatar) */}
          <div className="relative shrink-0">
            <div className="h-40 w-40 md:h-52 md:w-52 rounded-2xl overflow-hidden border-4 border-secondary shadow-xl bg-secondary">
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </div>

          {/* TITRE ET INFO LINE */}
          <div className="flex-1 pb-2 w-full">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-medium text-muted-foreground">
                <Badge
                  className={`${getDifficultyColor(difficulty)} text-white border-none shadow-none`}
                >
                  {t(`Difficulties.${difficulty}`)}
                </Badge>

                <span className="flex items-center hover:text-primary transition-colors">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                  {location}
                </span>

                <span className="flex items-center" title="Distance totale">
                  <Map className="w-4 h-4 mr-1.5" />
                  {totalDistance.toFixed(1)} km
                </span>

                <span className="flex items-center" title="Dénivelé positif">
                  <Mountain className="w-4 h-4 mr-1.5" />
                  {totalElevation} m
                </span>

                <span className="flex items-center" title="Nombre de parcours">
                  <Trophy className="w-4 h-4 mr-1.5" />
                  {tracksCount} {t('stages')}
                </span>

                <span className="flex items-center" title="Date de création">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {dateStr}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading uppercase text-primary drop-shadow-sm mt-1">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
