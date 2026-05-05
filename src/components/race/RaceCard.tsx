import Image from 'next/image'
import { Link } from '@/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  Zap,
  Lock,
  Globe,
} from 'lucide-react'
import { RaceAccessType, RaceFormat, RaceStatus } from '@prisma/client'
import type { RaceSummary } from '@/actions/race/race.types'

const FORMAT_LABELS: Record<RaceFormat, string> = {
  ONE_SHOT: 'Course',
  BACKYARD: 'Backyard',
}

const ACCESS_LABELS: Record<RaceAccessType, string> = {
  PUBLIC_FREE: 'Inscription libre',
  PUBLIC_VALIDATION: 'Sur validation',
  PRIVATE: 'Privée',
}

const STATUS_STYLES: Record<RaceStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_REVIEW:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACTIVE:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_LABELS: Record<RaceStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_REVIEW: 'En attente',
  ACTIVE: 'Ouverte',
  CLOSED: 'Terminée',
  CANCELLED: 'Annulée',
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

type Props = {
  race: RaceSummary
  showStatus?: boolean
  href?: string
}

export function RaceCard({ race, showStatus = false, href }: Props) {
  const imageUrl = race.bannerId ? `/api/files/${race.bannerId}` : null
  const target = href ?? `/races/${race.id}`

  return (
    <Link
      href={target}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow duration-200"
    >
      {/* Banner */}
      <div className="relative h-36 bg-muted overflow-hidden shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={race.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        {/* Format badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {race.format === RaceFormat.BACKYARD ? (
            <>
              <RefreshCw className="w-2.5 h-2.5" />
              Backyard
            </>
          ) : race.accessType === RaceAccessType.PUBLIC_FREE ? (
            <>
              <Globe className="w-2.5 h-2.5" />
              Compétitif
            </>
          ) : (
            <>
              <Zap className="w-2.5 h-2.5" />
              Course
            </>
          )}
        </div>

        {/* Access badge */}
        {race.accessType === RaceAccessType.PRIVATE && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5" />
            Privée
          </div>
        )}

        {/* Status badge (admin/organizer view) */}
        {showStatus && (
          <div
            className={`absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[race.status]}`}
          >
            {STATUS_LABELS[race.status]}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
          {race.title}
        </h3>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          {race.track.title} · {race.track.distance.toFixed(1)} km
        </p>

        <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-border">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3 shrink-0" />
            {formatDate(race.startAt)}
            {race.format === RaceFormat.BACKYARD &&
              race.loopDurationMinutes && (
                <span className="ml-1 flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  boucle /{' '}
                  {race.loopDurationMinutes >= 60
                    ? `${race.loopDurationMinutes / 60}h`
                    : `${race.loopDurationMinutes}min`}
                </span>
              )}
          </p>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3 shrink-0" />
              {race.registrationCount}
              {race.maxParticipants ? ` / ${race.maxParticipants}` : ''}{' '}
              participant{race.registrationCount !== 1 ? 's' : ''}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {ACCESS_LABELS[race.accessType]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
