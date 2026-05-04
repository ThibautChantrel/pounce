import db from '@/server/db'
import {
  LoopStatus,
  RaceFormat,
  RegistrationStatus,
  ValidationSource,
} from '@prisma/client'
import type { StravaActivity } from '../strava/strava.client'

export async function updateRaceFromStravaMatch(
  userId: string,
  trackId: string,
  activity: StravaActivity
): Promise<void> {
  const races = await db.race.findMany({
    where: { trackId, status: 'ACTIVE' },
    select: { id: true, format: true },
  })

  for (const race of races) {
    const reg = await db.raceRegistration.findUnique({
      where: { raceId_userId: { raceId: race.id, userId } },
      select: { id: true, status: true, totalTimeSeconds: true },
    })
    if (!reg) continue
    if (
      (
        [
          RegistrationStatus.DNF,
          RegistrationStatus.DNS,
          RegistrationStatus.DISQUALIFIED,
        ] as RegistrationStatus[]
      ).includes(reg.status)
    )
      continue

    if (race.format === RaceFormat.ONE_SHOT) {
      const newTime = activity.moving_time
      // Only update if no time yet, or activity is faster
      if (reg.totalTimeSeconds && reg.totalTimeSeconds <= newTime) continue

      const activityStart = new Date(activity.start_date)
      await db.raceRegistration.update({
        where: { id: reg.id },
        data: {
          totalTimeSeconds: newTime,
          stravaActivityId: String(activity.id),
          status: RegistrationStatus.VALIDATED,
          validationSource: ValidationSource.AUTO,
          validatedAt: new Date(),
          finishedAt: new Date(activityStart.getTime() + newTime * 1000),
        },
      })
      await recalculateRaceRanks(race.id)
    } else if (race.format === RaceFormat.BACKYARD) {
      const completedCount = await db.backyardLoop.count({
        where: { registrationId: reg.id, status: { not: LoopStatus.MISSED } },
      })
      const loopNumber = completedCount + 1

      const existing = await db.backyardLoop.findUnique({
        where: {
          registrationId_loopNumber: {
            registrationId: reg.id,
            loopNumber,
          },
        },
      })
      if (existing) continue

      const activityStart = new Date(activity.start_date)
      await db.backyardLoop.create({
        data: {
          registrationId: reg.id,
          loopNumber,
          stravaActivityId: String(activity.id),
          startedAt: activityStart,
          completedAt: new Date(
            activityStart.getTime() + activity.moving_time * 1000
          ),
          timeSeconds: activity.moving_time,
          avgSpeed: activity.average_speed * 3.6,
          status: LoopStatus.VALIDATED,
          validationSource: ValidationSource.AUTO,
          validatedAt: new Date(),
        },
      })
    }
  }
}

export async function recalculateRaceRanks(raceId: string): Promise<void> {
  const validated = await db.raceRegistration.findMany({
    where: {
      raceId,
      status: RegistrationStatus.VALIDATED,
      totalTimeSeconds: { not: null },
    },
    orderBy: { totalTimeSeconds: 'asc' },
    select: { id: true },
  })

  await Promise.all(
    validated.map((reg, i) =>
      db.raceRegistration.update({
        where: { id: reg.id },
        data: { rank: i + 1 },
      })
    )
  )
}
