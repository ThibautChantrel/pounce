import Image from 'next/image'
import { MapPin, Map, CheckCircle2 } from 'lucide-react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'
import type {
  CompletedChallenge,
  InProgressChallenge,
} from '@/actions/user/user.certifications.actions'

type Props =
  | { kind: 'completed'; data: CompletedChallenge }
  | { kind: 'inProgress'; data: InProgressChallenge }

export function UserChallengeCard(props: Props) {
  const t = useTranslations('Profile')

  const isCompleted = props.kind === 'completed'

  const id = props.data.challenge.id
  const title = props.data.challenge.title
  const location = props.data.challenge.location
  const coverId = props.data.challenge.coverId
  const totalDistance =
    props.kind === 'completed'
      ? props.data.challenge.totalDistance
      : props.data.challenge.totalDistance

  const completed =
    props.kind === 'completed'
      ? props.data.challenge.trackCount
      : props.data.completedCount
  const total =
    props.kind === 'completed'
      ? props.data.challenge.trackCount
      : props.data.challenge.totalTracks

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const imageUrl = coverId
    ? `/api/files/${coverId}`
    : '/images/placeholder-challenge.jpg'

  return (
    <div className="bg-card border rounded-2xl overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="relative h-36 bg-muted shrink-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 300px"
        />
        {isCompleted && (
          <div className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            {t('completedBadge')}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-sm leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            {location}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Map className="w-3 h-3" />
            {totalDistance.toFixed(1)} km
          </span>
          <span>
            {total} {t('steps')}
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>{t('progressLabel')}</span>
            <span>
              {completed}/{total}
            </span>
          </div>
          <Progress value={pct} className={isCompleted ? 'h-1.5' : 'h-1.5'} />
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full mt-auto w-full"
        >
          <Link href={`/challenges/${id}`}>{t('viewSteps')}</Link>
        </Button>
      </div>
    </div>
  )
}
