import Image from 'next/image'
import { Map, Timer, Zap, ImageOff } from 'lucide-react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import type { CompletedTrack } from '@/actions/user/user.certifications.actions'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
}

export function UserTrackCertCard({ cert }: { cert: CompletedTrack }) {
  const t = useTranslations('Profile')
  const { track, completedAt, avgSpeed, totalTime } = cert
  const imageUrl = track.coverId ? `/api/files/${track.coverId}` : null
  const dateStr = new Date(completedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-card border rounded-2xl overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="relative h-36 bg-muted shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={track.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 300px"
          />
        ) : (
          <ImageOff className="w-8 h-8 text-muted-foreground/30" />
        )}
        <div className="absolute top-2.5 right-2.5 bg-black/55 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
          {dateStr}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-sm leading-tight line-clamp-2">
          {track.title}
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Map className="w-3 h-3" />
            {track.distance} km
          </span>
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {formatTime(totalTime)}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {avgSpeed.toFixed(1)} km/h
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full mt-auto w-full"
        >
          <Link href={`/tracks/${track.id}`}>{t('viewTrack')}</Link>
        </Button>
      </div>
    </div>
  )
}
