import db from '@/server/db'
import {
  ActivityMode,
  LoopStatus,
  RaceFormat,
  ValidationSource,
} from '@prisma/client'
import { checkAndCertifyChallenges } from '../strava/certification.service'

function activityTypeFromMode(mode: ActivityMode): string {
  if (mode === ActivityMode.RUN) return 'Run'
  if (mode === ActivityMode.RIDE) return 'Ride'
  return 'Other'
}

export async function certifyRaceRegistration(
  registrationId: string,
  manualMetrics?: {
    avgSpeed?: number | null
    maxSpeed?: number | null
    heartRateAvg?: number | null
    heartRateMax?: number | null
    calories?: number | null
    completedAt?: Date | null
  }
): Promise<{
  certifiedTrackId: string | null
  certifiedChallengeIds: string[]
}> {
  const reg = await db.raceRegistration.findUnique({
    where: { id: registrationId },
    select: {
      userId: true,
      totalTimeSeconds: true,
      finishedAt: true,
      validatedAt: true,
      race: {
        select: {
          trackId: true,
          format: true,
          activityMode: true,
          track: { select: { distance: true, elevationGain: true } },
        },
      },
      backyardLoops: {
        where: { status: LoopStatus.VALIDATED },
        orderBy: { loopNumber: 'desc' },
        select: { loopNumber: true, timeSeconds: true, completedAt: true },
      },
    },
  })

  if (!reg) return { certifiedTrackId: null, certifiedChallengeIds: [] }

  let totalTimeSeconds: number
  let distance: number
  let elevationGain: number
  let completedAt: Date

  if (reg.race.format === RaceFormat.BACKYARD) {
    const loops = reg.backyardLoops
    if (loops.length === 0)
      return { certifiedTrackId: null, certifiedChallengeIds: [] }

    totalTimeSeconds = loops.reduce((sum, l) => sum + (l.timeSeconds ?? 0), 0)
    // Distance et dénivelé totaux = nb de boucles × valeurs du parcours
    distance = loops.length * reg.race.track.distance
    elevationGain = loops.length * reg.race.track.elevationGain
    // loops est trié loopNumber DESC → premier élément = dernière boucle
    completedAt = loops[0].completedAt ?? reg.validatedAt ?? new Date()
  } else {
    if (!reg.totalTimeSeconds)
      return { certifiedTrackId: null, certifiedChallengeIds: [] }
    totalTimeSeconds = reg.totalTimeSeconds
    distance = reg.race.track.distance
    elevationGain = reg.race.track.elevationGain
    completedAt = reg.finishedAt ?? reg.validatedAt ?? new Date()
  }

  // Idempotence : ne pas créer deux fois la même certification
  const existing = await db.trackCertification.findUnique({
    where: {
      provider_activityId_trackId: {
        provider: 'race',
        activityId: registrationId,
        trackId: reg.race.trackId,
      },
    },
  })
  if (existing) return { certifiedTrackId: null, certifiedChallengeIds: [] }

  const avgSpeed =
    totalTimeSeconds > 0 ? distance / (totalTimeSeconds / 3600) : 0

  await db.trackCertification.create({
    data: {
      userId: reg.userId,
      trackId: reg.race.trackId,
      provider: 'race',
      activityId: registrationId,
      activityType: activityTypeFromMode(reg.race.activityMode),
      avgSpeed: manualMetrics?.avgSpeed ?? avgSpeed,
      maxSpeed: manualMetrics?.maxSpeed ?? null,
      totalTime: totalTimeSeconds,
      distance,
      elevationGain,
      heartRateAvg: manualMetrics?.heartRateAvg ?? null,
      heartRateMax: manualMetrics?.heartRateMax ?? null,
      calories: manualMetrics?.calories ?? null,
      completedAt: manualMetrics?.completedAt ?? completedAt,
    },
  })

  const certifiedChallengeIds = await checkAndCertifyChallenges(reg.userId, [
    reg.race.trackId,
  ])

  return { certifiedTrackId: reg.race.trackId, certifiedChallengeIds }
}

export async function setRegistrationResult(
  registrationId: string,
  rank: number,
  totalTimeSeconds: number,
  actorId: string,
  manualMetrics?: {
    avgSpeed?: number | null
    maxSpeed?: number | null
    heartRateAvg?: number | null
    heartRateMax?: number | null
    calories?: number | null
    finishedAt?: Date | null
  }
) {
  const now = manualMetrics?.finishedAt ?? new Date()

  await db.raceRegistration.update({
    where: { id: registrationId },
    data: {
      rank,
      totalTimeSeconds,
      status: 'VALIDATED',
      validatedAt: now,
      finishedAt: now,
      validationSource: ValidationSource.ORGANIZER,
      statusUpdatedBy: actorId,
    },
  })

  return certifyRaceRegistration(registrationId, {
    avgSpeed: manualMetrics?.avgSpeed,
    maxSpeed: manualMetrics?.maxSpeed,
    heartRateAvg: manualMetrics?.heartRateAvg,
    heartRateMax: manualMetrics?.heartRateMax,
    calories: manualMetrics?.calories,
    completedAt: manualMetrics?.finishedAt ?? null,
  })
}
