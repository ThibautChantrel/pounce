import { getStravaSync } from '@/actions/strava-sync/strava-sync.admin.actions'
import {
  SyncDetails,
  SyncActivityLog,
} from '@/server/modules/strava/sync-log.types'
import { Badge } from '@/components/ui/badge'
import ActivityVisualizer from '@/components/admin/strava-syncs/ActivityVisualizer'
import { Link } from '@/navigation'
import { getTranslations, getFormatter } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  matched: 'default',
  no_match: 'outline',
  no_polyline: 'secondary',
  skipped: 'secondary',
  error: 'destructive',
}

export default async function StravaSyncShowPage({ params }: PageProps) {
  const { id } = await params
  const sync = await getStravaSync(id)
  if (!sync) notFound()

  const t = await getTranslations('Admin.StravaSyncs')
  const format = await getFormatter()

  const details = sync.details as unknown as SyncDetails
  const activities: SyncActivityLog[] = details?.activities ?? []

  const u = sync.user
  const userName =
    [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email

  return (
    <div className="h-full flex-1 flex-col space-y-6 p-8 flex">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/strava-syncs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('backToList')}
        </Link>
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t('showTitle')}
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t('showSubtitle', {
                user: userName,
                date: format.dateTime(new Date(sync.syncedAt), {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              })}
            </p>
          </div>
          <Badge
            variant={sync.source === 'manual' ? 'outline' : 'secondary'}
            className="ml-auto"
          >
            {sync.source === 'manual' ? t('sourceManual') : t('sourceWebhook')}
          </Badge>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t('processed')}</p>
          <p className="text-2xl font-bold tabular-nums">
            {details?.activitiesProcessed ?? 0}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t('matched')}</p>
          <p className="text-2xl font-bold tabular-nums text-green-600">
            {details?.activitiesMatched ?? 0}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 col-span-2">
          <p className="text-xs text-muted-foreground">{t('user')}</p>
          <Link
            href={`/admin/users/${u.id}`}
            className="text-sm font-medium hover:underline hover:text-blue-600"
          >
            {userName}
          </Link>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      </div>

      {/* Activities table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">{t('activityId')}</th>
              <th className="px-4 py-3 text-left">{t('activityName')}</th>
              <th className="px-4 py-3 text-left">{t('status')}</th>
              <th className="px-4 py-3 text-left">{t('matchedTracks')}</th>
              <th className="px-4 py-3 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t('noActivities')}
                </td>
              </tr>
            )}
            {activities.map((activity) => (
              <tr
                key={activity.stravaActivityId}
                className="border-b last:border-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3 font-mono text-xs">
                  {activity.stravaActivityId}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {activity.activityName ?? (
                    <span className="italic">{t('noName')}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[activity.status] ?? 'outline'}>
                    {t(`status_${activity.status}`)}
                  </Badge>
                  {activity.errorMessage && (
                    <p className="text-xs text-red-500 mt-0.5">
                      {activity.errorMessage}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {activity.matchedTracks.length === 0 ? (
                    <span className="text-muted-foreground text-xs">—</span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {activity.matchedTracks.map((mt) => (
                        <div
                          key={mt.trackId}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <Link
                            href={`/admin/tracks/${mt.trackId}`}
                            className="hover:underline hover:text-blue-600 font-medium"
                          >
                            {mt.trackTitle}
                          </Link>
                          <span className="text-muted-foreground">
                            ({mt.matchedPoints}/{mt.totalPoints})
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0"
                          >
                            {mt.direction}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ActivityVisualizer
                    stravaActivityId={activity.stravaActivityId}
                    userId={sync.userId}
                    trackId={activity.matchedTracks[0]?.trackId ?? null}
                    trackTitle={activity.matchedTracks[0]?.trackTitle ?? null}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
