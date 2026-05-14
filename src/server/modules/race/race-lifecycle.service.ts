import db from '@/server/db'
import {
  LoopStatus,
  RaceFormat,
  RaceStatus,
  RegistrationStatus,
} from '@prisma/client'
import { certifyRaceRegistration } from './race-certification.service'
import {
  recalculateBackyardRanks,
  recalculateRaceRanks,
} from './race-result.service'

// ─── ACTIVE → IN_PROGRESS ────────────────────────────────────────────────

export async function onRaceStarted(_raceId: string): Promise<void> {
  // Hook pour les effets de bord au démarrage (Strava sync initial, notifications…)
}

export async function startRacesDue(): Promise<{ started: number }> {
  const now = new Date()
  const races = await db.race.findMany({
    where: {
      status: RaceStatus.ACTIVE,
      startAt: { lte: now },
      endAt: { gt: now },
    },
    select: { id: true },
  })

  for (const race of races) {
    await db.race.update({
      where: { id: race.id },
      data: { status: RaceStatus.IN_PROGRESS },
    })
    await onRaceStarted(race.id)
  }

  return { started: races.length }
}

// ─── IN_PROGRESS → CLOSED ────────────────────────────────────────────────

export async function onRaceClosed(raceId: string): Promise<{
  certifications: number
}> {
  const race = await db.race.findUnique({
    where: { id: raceId },
    select: {
      id: true,
      format: true,
      registrations: {
        where: {
          status: {
            in: [
              RegistrationStatus.REGISTERED,
              RegistrationStatus.VALIDATED,
              RegistrationStatus.DNF,
            ],
          },
        },
        select: {
          id: true,
          status: true,
          totalTimeSeconds: true,
          backyardLoops: {
            where: { status: LoopStatus.VALIDATED },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  })

  if (!race) return { certifications: 0 }

  // Recalcul des classements avant certification
  if (race.format === RaceFormat.BACKYARD) {
    await recalculateBackyardRanks(raceId)
  } else {
    await recalculateRaceRanks(raceId)
  }

  let totalCertifications = 0

  for (const reg of race.registrations) {
    const shouldCertify =
      race.format === RaceFormat.BACKYARD
        ? reg.backyardLoops.length > 0
        : reg.status === RegistrationStatus.VALIDATED &&
          reg.totalTimeSeconds !== null

    if (!shouldCertify) continue

    // En backyard : les participants encore REGISTERED à la clôture passent VALIDATED
    if (
      race.format === RaceFormat.BACKYARD &&
      reg.status === RegistrationStatus.REGISTERED
    ) {
      await db.raceRegistration.update({
        where: { id: reg.id },
        data: {
          status: RegistrationStatus.VALIDATED,
          validatedAt: new Date(),
          statusUpdatedBy: 'system',
        },
      })
    }

    const cert = await certifyRaceRegistration(reg.id)
    if (cert.certifiedTrackId) totalCertifications++
  }

  return { certifications: totalCertifications }
}

export async function closeRacesDue(): Promise<{
  closed: number
  certifications: number
}> {
  const now = new Date()
  const races = await db.race.findMany({
    where: { status: RaceStatus.IN_PROGRESS, endAt: { lte: now } },
    select: { id: true },
  })

  if (races.length === 0) return { closed: 0, certifications: 0 }

  let totalCertifications = 0
  for (const race of races) {
    await db.race.update({
      where: { id: race.id },
      data: { status: RaceStatus.CLOSED },
    })
    const result = await onRaceClosed(race.id)
    totalCertifications += result.certifications
  }

  return { closed: races.length, certifications: totalCertifications }
}
