import { getTranslations } from 'next-intl/server'
import { Trophy, Map, TrendingUp } from 'lucide-react'
import { UserChallengeCard } from './UserChallengeCard'
import { UserTrackCertCard } from './UserTrackCertCard'
import type {
  CompletedChallenge,
  CompletedTrack,
  InProgressChallenge,
} from '@/actions/user/user.certifications.actions'

type Props = {
  completedChallenges: CompletedChallenge[]
  completedTracks: CompletedTrack[]
  inProgressChallenges: InProgressChallenge[]
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode
  title: string
  count: number
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <span className="ml-auto text-xs text-muted-foreground font-medium tabular-nums">
        {count}
      </span>
    </div>
  )
}

export async function ProfileCertifications({
  completedChallenges,
  completedTracks,
  inProgressChallenges,
}: Props) {
  const t = await getTranslations('Profile')

  const hasContent =
    completedChallenges.length > 0 ||
    completedTracks.length > 0 ||
    inProgressChallenges.length > 0

  if (!hasContent) return null

  return (
    <div className="space-y-6">
      {/* In progress */}
      {inProgressChallenges.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <SectionHeader
            icon={<TrendingUp className="w-4 h-4" />}
            title={t('myInProgressChallenges')}
            count={inProgressChallenges.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressChallenges.map(({ challenge, completedCount }) => (
              <UserChallengeCard
                key={challenge.id}
                kind="inProgress"
                data={{ challenge, completedCount }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed challenges */}
      {completedChallenges.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <SectionHeader
            icon={<Trophy className="w-4 h-4" />}
            title={t('myCompletedChallenges')}
            count={completedChallenges.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedChallenges.map((cert) => (
              <UserChallengeCard key={cert.id} kind="completed" data={cert} />
            ))}
          </div>
        </div>
      )}

      {/* Completed tracks */}
      {completedTracks.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6">
          <SectionHeader
            icon={<Map className="w-4 h-4" />}
            title={t('myCompletedTracks')}
            count={completedTracks.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTracks.map((cert) => (
              <UserTrackCertCard key={cert.id} cert={cert} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
