import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Props = {
  title: string
  coverUrl: string
  createdAt: string
  hasGpx: boolean
}

export function TrackHero({ title, coverUrl, createdAt, hasGpx }: Props) {
  const t = useTranslations('Tracks')

  return (
    <div className="relative h-[40vh] min-h-75 w-full group overflow-hidden">
      <Image
        src={coverUrl}
        alt={title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute inset-0 container max-w-5xl mx-auto px-4 flex flex-col justify-end pb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className="bg-white/20 text-white backdrop-blur-md border-none">
            {t('track')}
          </Badge>
          {hasGpx && (
            <Badge variant="outline" className="text-white border-white/40">
              {t('GpxAvailable')}
            </Badge>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white uppercase mb-2">
          {title}
        </h1>

        <div className="flex items-center text-white/80">
          <Calendar className="w-4 h-4 mr-2" />
          {t('createdAt')} {createdAt}
        </div>
      </div>
    </div>
  )
}
