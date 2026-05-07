import { NextRequest, NextResponse } from 'next/server'
import db from '@/server/db'
import {
  LoopStatus,
  RaceFormat,
  RaceStatus,
  RegistrationStatus,
} from '@prisma/client'
import { fetchStravaAthleteActivities } from '@/server/modules/strava/strava.client'
import { processStravaActivity } from '@/server/modules/strava/certification.service'
import { certifyRaceRegistration } from '@/server/modules/race/race-certification.service'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const racesToClose = await db.race.findMany({
    where: { status: RaceStatus.ACTIVE, endAt: { lte: now } },
    select: {
      id: true,
      format: true,
      registrations: {
        where: {
          status: {
            in: [RegistrationStatus.REGISTERED, RegistrationStatus.VALIDATED],
          },
        },
        select: {
          id: true,
          userId: true,
          status: true,
          totalTimeSeconds: true,
          // Pour BACKYARD : détecter si au moins une boucle validée existe
          backyardLoops: {
            where: { status: LoopStatus.VALIDATED },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  })

  if (racesToClose.length === 0) {
    return NextResponse.json({ closed: 0, message: 'Nothing to close' })
  }

  const DEFAULT_AFTER_UNIX = Math.floor(
    new Date('2026-01-01T00:00:00Z').getTime() / 1000
  )

  let totalSyncedActivities = 0
  let totalCertifications = 0

  for (const race of racesToClose) {
    await db.race.update({
      where: { id: race.id },
      data: { status: RaceStatus.CLOSED },
    })

    for (const reg of race.registrations) {
      const shouldCertify =
        reg.status === RegistrationStatus.VALIDATED
          ? race.format === RaceFormat.BACKYARD
            ? reg.backyardLoops.length > 0
            : reg.totalTimeSeconds !== null
          : false

      if (shouldCertify) {
        const cert = await certifyRaceRegistration(reg.id)
        if (cert.certifiedTrackId) totalCertifications++
      }

      // Sync Strava finale pour tous les participants
      const stravaAccount = await db.account.findFirst({
        where: { userId: reg.userId, provider: 'strava' },
      })
      if (!stravaAccount) continue

      try {
        const lastCert = await db.trackCertification.findFirst({
          where: { userId: reg.userId, provider: 'strava' },
          orderBy: { completedAt: 'desc' },
          select: { completedAt: true },
        })
        const after = lastCert
          ? Math.floor(lastCert.completedAt.getTime() / 1000)
          : DEFAULT_AFTER_UNIX

        const activities = await fetchStravaAthleteActivities(reg.userId, after)
        for (const activity of activities) {
          await processStravaActivity(reg.userId, String(activity.id))
          totalSyncedActivities++
        }
      } catch {
        // skip athlete on error
      }
    }
  }

  console.log(
    `[cron/race-close] Closed ${racesToClose.length} race(s), ` +
      `${totalSyncedActivities} activities synced, ` +
      `${totalCertifications} certifications created`
  )

  return NextResponse.json({
    closed: racesToClose.length,
    syncedActivities: totalSyncedActivities,
    certifications: totalCertifications,
  })
}
