import db from '@/server/db'
import {
  RaceAccessType,
  RaceStatus,
  RegistrationStatus,
  Role,
} from '@prisma/client'

export const registrationService = {
  async register(raceId: string, userId: string, accessCode?: string) {
    const race = await db.race.findUniqueOrThrow({
      where: { id: raceId },
      select: {
        status: true,
        format: true,
        accessType: true,
        accessCode: true,
        maxParticipants: true,
        _count: { select: { registrations: true } },
      },
    })

    if (race.status !== RaceStatus.ACTIVE) {
      throw new Error('race_not_active')
    }

    // Les courses ouvertes (ONE_SHOT + PUBLIC_FREE) n'acceptent pas d'inscription manuelle
    if (
      race.format === 'ONE_SHOT' &&
      race.accessType === RaceAccessType.PUBLIC_FREE
    ) {
      throw new Error('open_race_no_manual_registration')
    }

    if (race.accessType === RaceAccessType.PRIVATE) {
      if (!accessCode || accessCode !== race.accessCode) {
        throw new Error('invalid_access_code')
      }
    }

    if (
      race.maxParticipants !== null &&
      race._count.registrations >= race.maxParticipants
    ) {
      throw new Error('race_full')
    }

    const existing = await db.raceRegistration.findUnique({
      where: { raceId_userId: { raceId, userId } },
    })
    if (existing) throw new Error('already_registered')

    const status =
      race.accessType === RaceAccessType.PUBLIC_VALIDATION
        ? RegistrationStatus.PENDING
        : RegistrationStatus.REGISTERED

    return db.raceRegistration.create({
      data: { raceId, userId, status },
    })
  },

  async cancelRegistration(raceId: string, userId: string) {
    const reg = await db.raceRegistration.findUnique({
      where: { raceId_userId: { raceId, userId } },
    })
    if (!reg) throw new Error('not_registered')
    if (reg.status === RegistrationStatus.VALIDATED)
      throw new Error('already_validated')

    return db.raceRegistration.delete({
      where: { raceId_userId: { raceId, userId } },
    })
  },

  async validateRegistration(
    registrationId: string,
    organizerId: string,
    userRole: Role
  ) {
    const reg = await db.raceRegistration.findUniqueOrThrow({
      where: { id: registrationId },
      select: { race: { select: { organizerId: true } } },
    })
    if (reg.race.organizerId !== organizerId && userRole !== Role.ADMIN) {
      throw new Error('unauthorized')
    }
    return db.raceRegistration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.REGISTERED, validatedAt: new Date() },
    })
  },

  async updateStatus(
    registrationId: string,
    status: RegistrationStatus,
    reason: string | undefined,
    actorId: string,
    actorRole: Role
  ) {
    const reg = await db.raceRegistration.findUniqueOrThrow({
      where: { id: registrationId },
      select: { race: { select: { organizerId: true } } },
    })
    if (reg.race.organizerId !== actorId && actorRole !== Role.ADMIN) {
      throw new Error('unauthorized')
    }
    return db.raceRegistration.update({
      where: { id: registrationId },
      data: { status, statusReason: reason ?? null, statusUpdatedBy: actorId },
    })
  },

  async listForUser(userId: string) {
    const regs = await db.raceRegistration.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        rank: true,
        totalTimeSeconds: true,
        registeredAt: true,
        backyardLoops: {
          where: { status: 'VALIDATED' },
          select: { id: true },
        },
        race: {
          select: {
            id: true,
            title: true,
            format: true,
            status: true,
            startAt: true,
            bannerId: true,
            track: { select: { title: true, distance: true } },
          },
        },
      },
      orderBy: { race: { startAt: 'desc' } },
    })
    return regs.map((r) => ({
      id: r.id,
      status: r.status,
      rank: r.rank,
      totalTimeSeconds: r.totalTimeSeconds,
      registeredAt: r.registeredAt,
      validatedLoopCount: r.backyardLoops.length,
      race: r.race,
    }))
  },

  async getUserRegistration(raceId: string, userId: string) {
    const reg = await db.raceRegistration.findUnique({
      where: { raceId_userId: { raceId, userId } },
      select: {
        id: true,
        status: true,
        registeredAt: true,
        totalTimeSeconds: true,
        rank: true,
        backyardLoops: {
          select: {
            loopNumber: true,
            status: true,
            timeSeconds: true,
            completedAt: true,
            heartRateAvg: true,
            heartRateMax: true,
          },
          orderBy: { loopNumber: 'asc' },
        },
      },
    })
    if (!reg) return null

    const cert = await db.trackCertification.findFirst({
      where: { provider: 'race', activityId: reg.id },
      select: { heartRateAvg: true, heartRateMax: true },
    })

    return {
      ...reg,
      heartRateAvg: cert?.heartRateAvg ?? null,
      heartRateMax: cert?.heartRateMax ?? null,
    }
  },
}
