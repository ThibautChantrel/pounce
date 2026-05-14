import { NextRequest, NextResponse } from 'next/server'
import db from '@/server/db'
import { RaceStatus } from '@prisma/client'
import { fetchStravaAthleteActivities } from '@/server/modules/strava/strava.client'
import { processStravaActivity } from '@/server/modules/strava/certification.service'
import { closeRacesDue } from '@/server/modules/race/race-lifecycle.service'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { closed, certifications } = await closeRacesDue()

  if (closed === 0) {
    return NextResponse.json({ closed: 0, message: 'Nothing to close' })
  }

  // Sync Strava finale pour les participants des courses clôturées
  const DEFAULT_AFTER_UNIX = Math.floor(
    new Date('2026-01-01T00:00:00Z').getTime() / 1000
  )

  const closedRaces = await db.race.findMany({
    where: { status: RaceStatus.CLOSED },
    select: { registrations: { select: { userId: true } } },
  })

  let totalSyncedActivities = 0
  const userIds = [
    ...new Set(
      closedRaces.flatMap((r) => r.registrations.map((x) => x.userId))
    ),
  ]

  for (const userId of userIds) {
    const stravaAccount = await db.account.findFirst({
      where: { userId, provider: 'strava' },
    })
    if (!stravaAccount) continue

    try {
      const lastCert = await db.trackCertification.findFirst({
        where: { userId, provider: 'strava' },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      })
      const after = lastCert
        ? Math.floor(lastCert.completedAt.getTime() / 1000)
        : DEFAULT_AFTER_UNIX

      const activities = await fetchStravaAthleteActivities(userId, after)
      for (const activity of activities) {
        await processStravaActivity(userId, String(activity.id))
        totalSyncedActivities++
      }
    } catch {
      // skip athlete on error
    }
  }

  console.log(
    `[cron/race-close] Closed ${closed} race(s), ` +
      `${totalSyncedActivities} activities synced, ` +
      `${certifications} certifications created`
  )

  return NextResponse.json({
    closed,
    syncedActivities: totalSyncedActivities,
    certifications,
  })
}
