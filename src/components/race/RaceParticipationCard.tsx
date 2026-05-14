import Image from 'next/image'
import { Link } from '@/navigation'
import {
  Calendar,
  RefreshCw,
  Zap,
  Trophy,
  Timer,
  XCircle,
  MinusCircle,
  ShieldOff,
} from 'lucide-react'
import { RaceFormat, RegistrationStatus } from '@prisma/client'

type Participation = {
  id: string
  status: RegistrationStatus
  rank: number | null
  totalTimeSeconds: number | null
  validatedLoopCount: number
  race: {
    id: string
    title: string
    format: RaceFormat
    startAt: Date
    bannerId: string | null
    track: { title: string; distance: number }
  }
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}h${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span>🥇</span>
  if (rank === 2) return <span>🥈</span>
  if (rank === 3) return <span>🥉</span>
  return <span>#{rank}</span>
}

export function RaceParticipationCard({
  participation,
}: {
  participation: Participation
}) {
  const { race, status, rank, totalTimeSeconds, validatedLoopCount } =
    participation
  const imageUrl = race.bannerId ? `/api/files/${race.bannerId}` : null
  const isOneShot = race.format === RaceFormat.ONE_SHOT
  const isBackyard = race.format === RaceFormat.BACKYARD

  const dateStr = new Date(race.startAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      href={`/races/${race.id}`}
      className="group relative flex flex-col aspect-[5/4] rounded-2xl overflow-hidden cursor-pointer"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={race.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
      )}

      <div className="absolute inset-0 bg-black/25" />

      {/* Top — titre + date */}
      <div className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-black/75 via-black/25 to-transparent p-3 z-10 flex flex-col">
        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow-sm">
          {race.title}
        </h3>
        <p className="text-white/60 text-[11px] flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3 shrink-0" />
          {dateStr}
        </p>
      </div>

      {/* Bottom — résultat */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3 z-10 flex flex-col justify-end gap-1">
        {status === RegistrationStatus.VALIDATED && isOneShot && (
          <div className="flex items-center gap-2 text-white/90 text-[11px] font-semibold">
            {rank && (
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                <RankBadge rank={rank} />
              </span>
            )}
            {totalTimeSeconds && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatTime(totalTimeSeconds)}
              </span>
            )}
          </div>
        )}
        {status === RegistrationStatus.VALIDATED && isBackyard && (
          <div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
            <Trophy className="w-3 h-3 text-amber-400" />
            {validatedLoopCount} boucle{validatedLoopCount !== 1 ? 's' : ''}
          </div>
        )}
        {status === RegistrationStatus.DNF && (
          <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-medium">
            <XCircle className="w-3 h-3" /> DNF
          </div>
        )}
        {status === RegistrationStatus.DNS && (
          <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
            <MinusCircle className="w-3 h-3" /> DNS
          </div>
        )}
        {status === RegistrationStatus.DISQUALIFIED && (
          <div className="flex items-center gap-1.5 text-orange-400 text-[11px] font-medium">
            <ShieldOff className="w-3 h-3" /> DQ
          </div>
        )}
        {(status === RegistrationStatus.PENDING ||
          status === RegistrationStatus.REGISTERED) && (
          <div className="text-white/60 text-[11px]">Inscrit</div>
        )}
      </div>

      {/* Format badge */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/15">
        {isBackyard ? (
          <>
            <RefreshCw className="w-2.5 h-2.5" /> Backyard
          </>
        ) : (
          <>
            <Zap className="w-2.5 h-2.5" /> Course
          </>
        )}
      </div>
    </Link>
  )
}
