import db from '@/server/db'
import { ActivityMode, ValidationSource } from '@prisma/client'
import { checkAndCertifyChallenges } from '../strava/certification.service'

function activityTypeFromMode(mode: ActivityMode): string {
  if (mode === ActivityMode.RUN) return 'Run'
  if (mode === ActivityMode.RIDE) return 'Ride'
  return 'Other'
}

export async function certifyRaceRegistration(registrationId: string): Promise<{
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
          activityMode: true,
          track: { select: { distance: true, elevationGain: true } },
        },
      },
    },
  })

  if (!reg?.totalTimeSeconds) {
    return { certifiedTrackId: null, certifiedChallengeIds: [] }
  }

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

  const completedAt = reg.finishedAt ?? reg.validatedAt ?? new Date()
  const avgSpeed = reg.race.track.distance / (reg.totalTimeSeconds / 3600)

  await db.trackCertification.create({
    data: {
      userId: reg.userId,
      trackId: reg.race.trackId,
      provider: 'race',
      activityId: registrationId,
      activityType: activityTypeFromMode(reg.race.activityMode),
      avgSpeed,
      maxSpeed: null,
      totalTime: reg.totalTimeSeconds,
      distance: reg.race.track.distance,
      elevationGain: reg.race.track.elevationGain,
      completedAt,
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
  actorId: string
) {
  const now = new Date()

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

  return certifyRaceRegistration(registrationId)
}
