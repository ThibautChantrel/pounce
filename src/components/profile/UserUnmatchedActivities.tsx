import { getTranslations } from 'next-intl/server'
import { AlertCircle, Activity, ChevronDown } from 'lucide-react'
import type { UnmatchedActivity } from '@/actions/user/user.certifications.actions'
import { Link } from '@/navigation'

const DEFAULT_LIMIT = 5

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getActivityLink(activity: UnmatchedActivity): string | null {
  if (activity.provider === 'strava') {
    return `https://www.strava.com/activities/${activity.activityId}`
  }
  return null
}

export async function UserUnmatchedActivities({
  activities,
  showAll = false,
}: {
  activities: UnmatchedActivity[]
  showAll?: boolean
}) {
  const t = await getTranslations('Profile')

  if (activities.length === 0) return null

  const visible = showAll ? activities : activities.slice(0, DEFAULT_LIMIT)
  const hasMore = !showAll && activities.length > DEFAULT_LIMIT

  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            {t('unmatchedTitle')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('unmatchedSubtitle')}
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-medium tabular-nums ml-auto">
          {activities.length}
        </span>
      </div>

      <div className="divide-y divide-border">
        {visible.map((activity) => {
          const link = getActivityLink(activity)
          return (
            <div
              key={`${activity.provider}-${activity.activityId}`}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.activityName ?? t('unmatchedNoName')}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  {activity.activityType && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-medium">
                      {activity.activityType}
                    </span>
                  )}
                  {activity.distance != null && (
                    <span className="text-xs text-muted-foreground">
                      {activity.distance.toFixed(1)} km
                    </span>
                  )}
                  {activity.elevationGain != null &&
                    activity.elevationGain > 0 && (
                      <span className="text-xs text-muted-foreground">
                        +{Math.round(activity.elevationGain)} m
                      </span>
                    )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.completedAt)}
                  </span>
                </div>
              </div>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:underline shrink-0"
                >
                  {activity.provider} ↗
                </a>
              )}
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <Link
            href="?tab=historique&showAll=1"
            scroll={false}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            Voir les {activities.length - DEFAULT_LIMIT} autres activités
          </Link>
        </div>
      )}
    </div>
  )
}
