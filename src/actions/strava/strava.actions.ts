'use server'

import { auth } from '@/server/modules/auth/auth.config'
import db from '@/server/db'
import { processStravaActivity } from '@/server/modules/strava/certification.service'
import { fetchStravaAthleteActivities } from '@/server/modules/strava/strava.client'
import { createActivitySync } from '@/server/modules/strava/sync-log.service'
import { SyncActivityLog } from '@/server/modules/strava/sync-log.types'

const RESYNC_COOLDOWN_MS = 60 * 60 * 1000

export async function manualResyncAction(activityId?: string): Promise<{
  success: boolean
  error?: string
  certifiedTrackIds?: string[]
  certifiedChallengeIds?: string[]
  certifiedTrackTitles?: string[]
  certifiedChallengeTitles?: string[]
}> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'unauthorized' }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { success: false, error: 'not_found' }
  if (!user.isVerified) return { success: false, error: 'not_verified' }

  const stravaAccount = await db.account.findFirst({
    where: { userId: user.id, provider: 'strava' },
  })

  if (stravaAccount) {
    if (stravaAccount.lastResyncAt) {
      const elapsed = Date.now() - stravaAccount.lastResyncAt.getTime()
      if (elapsed < RESYNC_COOLDOWN_MS)
        return { success: false, error: 'rate_limited' }
    }

    await db.account.update({
      where: {
        provider_providerAccountId: {
          provider: 'strava',
          providerAccountId: stravaAccount.providerAccountId,
        },
      },
      data: { lastResyncAt: new Date() },
    })

    try {
      const allCertifiedTrackIds: string[] = []
      const allCertifiedChallengeIds: string[] = []
      const activityLogs: SyncActivityLog[] = []

      if (activityId) {
        const result = await processStravaActivity(user.id, activityId)
        activityLogs.push(result.activityLog)
        allCertifiedTrackIds.push(...result.certifiedTrackIds)
        allCertifiedChallengeIds.push(...result.certifiedChallengeIds)
      } else {
        const activities = await fetchStravaAthleteActivities(user.id, 10)
        for (const activity of activities) {
          const result = await processStravaActivity(
            user.id,
            String(activity.id)
          )
          activityLogs.push(result.activityLog)
          allCertifiedTrackIds.push(...result.certifiedTrackIds)
          allCertifiedChallengeIds.push(...result.certifiedChallengeIds)
        }
      }

      await createActivitySync(user.id, 'strava', 'manual', activityLogs)

      const uniqueTrackIds = [...new Set(allCertifiedTrackIds)]
      const uniqueChallengeIds = [...new Set(allCertifiedChallengeIds)]

      const [tracks, challenges] = await Promise.all([
        uniqueTrackIds.length
          ? db.track.findMany({
              where: { id: { in: uniqueTrackIds } },
              select: { id: true, title: true },
            })
          : Promise.resolve([]),
        uniqueChallengeIds.length
          ? db.challenge.findMany({
              where: { id: { in: uniqueChallengeIds } },
              select: { id: true, title: true },
            })
          : Promise.resolve([]),
      ])

      return {
        success: true,
        certifiedTrackIds: uniqueTrackIds,
        certifiedChallengeIds: uniqueChallengeIds,
        certifiedTrackTitles: tracks.map((t) => t.title),
        certifiedChallengeTitles: challenges.map((c) => c.title),
      }
    } catch (err) {
      console.error('[manualResync] strava error', err)
      return { success: false, error: 'internal_error' }
    }
  } else {
    // TODO: implementer les autres providers (garmin, etc.)
    return { success: false, error: 'no_provider_connected' }
  }
}

export async function getStravaStatusAction(): Promise<{
  connected: boolean
  stravaId: string | null
  lastResyncAt: Date | null
  canResync: boolean
}> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      connected: false,
      stravaId: null,
      lastResyncAt: null,
      canResync: false,
    }
  }

  const stravaAccount = await db.account.findFirst({
    where: { userId: session.user.id, provider: 'strava' },
    select: { providerAccountId: true, lastResyncAt: true },
  })

  if (!stravaAccount) {
    return {
      connected: false,
      stravaId: null,
      lastResyncAt: null,
      canResync: false,
    }
  }

  const canResync =
    !stravaAccount.lastResyncAt ||
    Date.now() - stravaAccount.lastResyncAt.getTime() >= RESYNC_COOLDOWN_MS

  return {
    connected: true,
    stravaId: stravaAccount.providerAccountId,
    lastResyncAt: stravaAccount.lastResyncAt,
    canResync,
  }
}
