import db from '@/server/db'
import {
  LoopStatus,
  Prisma,
  RaceAccessType,
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
    select: {
      id: true,
      format: true,
      accessType: true,
      startAt: true,
      endAt: true,
      loopDurationMinutes: true,
    },
  })

  const activityStart = new Date(activity.start_date)
  const activityEnd = new Date(
    activityStart.getTime() + activity.moving_time * 1000
  )

  for (const race of races) {
    if (race.format === RaceFormat.ONE_SHOT) {
      // L'activité doit se terminer avant la fin de la course
      if (activityEnd > race.endAt) continue

      let reg = await db.raceRegistration.findUnique({
        where: { raceId_userId: { raceId: race.id, userId } },
        select: { id: true, status: true, totalTimeSeconds: true },
      })

      // Auto-inscription pour les compétitions ouvertes (PUBLIC_FREE)
      if (!reg) {
        if (race.accessType === RaceAccessType.PUBLIC_FREE) {
          reg = await db.raceRegistration.create({
            data: {
              raceId: race.id,
              userId,
              status: RegistrationStatus.REGISTERED,
            },
            select: { id: true, status: true, totalTimeSeconds: true },
          })
        } else {
          continue
        }
      }

      if (isTerminalStatus(reg.status)) continue

      const newTime = activity.moving_time
      // Conserver uniquement le meilleur temps
      if (reg.totalTimeSeconds && reg.totalTimeSeconds <= newTime) continue

      await db.raceRegistration.update({
        where: { id: reg.id },
        data: {
          totalTimeSeconds: newTime,
          stravaActivityId: String(activity.id),
          status: RegistrationStatus.VALIDATED,
          validationSource: ValidationSource.AUTO,
          validatedAt: new Date(),
          finishedAt: activityEnd,
        },
      })
      await recalculateRaceRanks(race.id)
    } else if (race.format === RaceFormat.BACKYARD) {
      if (!race.loopDurationMinutes) continue

      const reg = await db.raceRegistration.findUnique({
        where: { raceId_userId: { raceId: race.id, userId } },
        select: { id: true, status: true },
      })
      if (!reg || isTerminalStatus(reg.status)) continue

      // Déduplication : une même activité Strava ne peut créer qu'une seule boucle
      const alreadyImported = await db.backyardLoop.findFirst({
        where: {
          registrationId: reg.id,
          stravaActivityId: String(activity.id),
        },
      })
      if (alreadyImported) continue

      // L'activité doit démarrer après le début de la course
      if (activityStart < race.startAt) continue

      // Numéro de boucle déduit de activityStart — déterministe, indépendant de l'ordre de traitement
      const loopDurationMs = race.loopDurationMinutes * 60_000
      const loopNumber =
        Math.floor(
          (activityStart.getTime() - race.startAt.getTime()) / loopDurationMs
        ) + 1

      // La boucle doit être complétée avant sa deadline
      const loopDeadline = new Date(
        race.startAt.getTime() + loopNumber * loopDurationMs
      )
      if (activityEnd > loopDeadline) continue

      try {
        await db.backyardLoop.create({
          data: {
            registrationId: reg.id,
            loopNumber,
            stravaActivityId: String(activity.id),
            startedAt: activityStart,
            completedAt: activityEnd,
            timeSeconds: activity.moving_time,
            avgSpeed: activity.average_speed * 3.6,
            heartRateAvg: activity.average_heartrate
              ? Math.round(activity.average_heartrate)
              : null,
            heartRateMax: activity.max_heartrate
              ? Math.round(activity.max_heartrate)
              : null,
            status: LoopStatus.VALIDATED,
            validationSource: ValidationSource.AUTO,
            validatedAt: new Date(),
          },
        })
        await recalculateBackyardRanks(race.id)
      } catch (e) {
        // Contrainte unique (registrationId, loopNumber) : doublon de sync concurrent, ignoré
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        )
          continue
        throw e
      }
    }
  }
}

function isTerminalStatus(status: RegistrationStatus): boolean {
  return (
    status === RegistrationStatus.DNF ||
    status === RegistrationStatus.DNS ||
    status === RegistrationStatus.DISQUALIFIED
  )
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

export async function recalculateBackyardRanks(raceId: string): Promise<void> {
  const regs = await db.raceRegistration.findMany({
    where: { raceId },
    select: {
      id: true,
      backyardLoops: {
        where: { status: LoopStatus.VALIDATED },
        orderBy: { loopNumber: 'desc' },
        take: 1,
        select: { loopNumber: true, completedAt: true },
      },
    },
  })

  const withLoops = regs
    .filter((r) => r.backyardLoops.length > 0)
    .sort((a, b) => {
      const aLoops = a.backyardLoops[0].loopNumber
      const bLoops = b.backyardLoops[0].loopNumber
      if (bLoops !== aLoops) return bLoops - aLoops
      // Égalité de boucles : le plus rapide à finir sa dernière boucle gagne
      const aTime = a.backyardLoops[0].completedAt?.getTime() ?? Infinity
      const bTime = b.backyardLoops[0].completedAt?.getTime() ?? Infinity
      return aTime - bTime
    })

  await Promise.all(
    withLoops.map((reg, i) =>
      db.raceRegistration.update({
        where: { id: reg.id },
        data: { rank: i + 1 },
      })
    )
  )
}
