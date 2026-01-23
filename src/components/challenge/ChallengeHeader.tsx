import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import { Difficulty } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import { fileWithoutData } from '@/server/modules/file/file.types'

interface ChallengeHeaderProps {
  title: string
  location: string
  difficulty: Difficulty
  banner: fileWithoutData | null
  cover: fileWithoutData | null
}

const getDifficultyColor = (diff: Difficulty) => {
  switch (diff) {
    case 'EASY':
      return 'bg-emerald-500 hover:bg-emerald-600'
    case 'MEDIUM':
      return 'bg-blue-500 hover:bg-blue-600'
    case 'HARD':
      return 'bg-orange-500 hover:bg-orange-600'
    case 'EXPERT':
      return 'bg-red-600 hover:bg-red-700'
    default:
      return 'bg-primary'
  }
}

export async function ChallengeHeader({
  title,
  location,
  difficulty,
  banner,
  cover,
}: ChallengeHeaderProps) {
  const t = await getTranslations('Challenges.ChallengeDetail')

  const bannerUrl = banner
    ? `/api/files/${banner.id}`
    : '/images/placeholder-banner.jpg'
  const coverUrl = cover
    ? `/api/files/${cover.id}`
    : '/images/placeholder-cover.jpg'

  return (
    <>
      {/* BANNIÈRE */}
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
          {/* COVER IMAGE */}
          <div className="relative shrink-0">
            <div className="h-40 w-40 md:h-52 md:w-52 rounded-2xl overflow-hidden border-4 border-white canopy shadow-xl bg-muted">
              <Image src={coverUrl} alt={title} fill className="object-cover" />
            </div>
          </div>

          {/* TITRE ET BADGES */}
          <div className="flex-1 canopy dark:text-zinc-100 pb-2 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    className={`${getDifficultyColor(difficulty)} text-white border-none`}
                  >
                    {t(`Difficulties.${difficulty}`)}
                  </Badge>
                  <span className="flex items-center text-sm text-muted-foreground font-medium">
                    <MapPin className="w-4 h-4 mr-1" /> {location}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading uppercase">
                  {title}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
