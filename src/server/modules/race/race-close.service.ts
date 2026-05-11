import db from '@/server/db'
import {
  LoopStatus,
  RaceFormat,
  RaceStatus,
  RegistrationStatus,
} from '@prisma/client'
import { certifyRaceRegistration } from './race-certification.service'

export async function closeRace(raceId: string): Promise<{
  certifications: number
}> {
  const race = await db.race.findUnique({
    where: { id: raceId },
    select: {
      id: true,
      format: true,
      status: true,
      registrations: {
        where: {
          status: {
            in: [RegistrationStatus.REGISTERED, RegistrationStatus.VALIDATED],
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

  let totalCertifications = 0

  for (const reg of race.registrations) {
    const shouldCertify =
      race.format === RaceFormat.BACKYARD
        ? reg.backyardLoops.length > 0
        : reg.status === RegistrationStatus.VALIDATED &&
          reg.totalTimeSeconds !== null

    if (!shouldCertify) continue

    // En backyard : les participants encore REGISTERED à la clôture
    // (jamais DNF) passent VALIDATED avant certification
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

export async function closeRacesIfDue(): Promise<{
  closed: number
  certifications: number
}> {
  const now = new Date()
  const racesToClose = await db.race.findMany({
    where: { status: RaceStatus.IN_PROGRESS, endAt: { lte: now } },
    select: { id: true },
  })

  if (racesToClose.length === 0) return { closed: 0, certifications: 0 }

  let totalCertifications = 0
  for (const race of racesToClose) {
    await db.race.update({
      where: { id: race.id },
      data: { status: RaceStatus.CLOSED },
    })
    const result = await closeRace(race.id)
    totalCertifications += result.certifications
  }

  return { closed: racesToClose.length, certifications: totalCertifications }
}
