'use server'

import { auth } from '@/server/modules/auth/auth.config'
import db from '@/server/db'
import { processStravaActivity } from '@/server/modules/strava/certification.service'
import { fetchStravaAthleteActivities } from '@/server/modules/strava/strava.client'

const RESYNC_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

export async function manualResyncAction(stravaActivityId?: string): Promise<{
  success: boolean
  error?: string
  certifiedTrackIds?: string[]
  certifiedChallengeIds?: string[]
}> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'unauthorized' }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { success: false, error: 'not_found' }
  if (!user.stravaId) return { success: false, error: 'strava_not_connected' }
  if (!user.isVerified) return { success: false, error: 'not_verified' }

  // Rate limit check
  if (user.stravaResyncAt) {
    const elapsed = Date.now() - user.stravaResyncAt.getTime()
    if (elapsed < RESYNC_COOLDOWN_MS) {
      return { success: false, error: 'rate_limited' }
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { stravaResyncAt: new Date() },
  })

  try {
    if (stravaActivityId) {
      const result = await processStravaActivity(user.id, stravaActivityId)
      return { success: true, ...result }
    }

    // No specific activity: re-sync the 10 most recent activities
    const activities = await fetchStravaAthleteActivities(user.id, 10)
    const allCertifiedTrackIds: string[] = []
    const allCertifiedChallengeIds: string[] = []

    for (const activity of activities) {
      const result = await processStravaActivity(user.id, String(activity.id))
      allCertifiedTrackIds.push(...result.certifiedTrackIds)
      allCertifiedChallengeIds.push(...result.certifiedChallengeIds)
    }

    return {
      success: true,
      certifiedTrackIds: [...new Set(allCertifiedTrackIds)],
      certifiedChallengeIds: [...new Set(allCertifiedChallengeIds)],
    }
  } catch (err) {
    console.error('[manualResync] error', err)
    return { success: false, error: 'internal_error' }
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

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { stravaId: true, stravaResyncAt: true },
  })

  if (!user)
    return {
      connected: false,
      stravaId: null,
      lastResyncAt: null,
      canResync: false,
    }

  const canResync =
    !user.stravaResyncAt ||
    Date.now() - user.stravaResyncAt.getTime() >= RESYNC_COOLDOWN_MS

  return {
    connected: !!user.stravaId,
    stravaId: user.stravaId,
    lastResyncAt: user.stravaResyncAt,
    canResync,
  }
}
