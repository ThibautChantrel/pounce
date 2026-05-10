import db from '@/server/db'
import {
  Prisma,
  RaceStatus,
  RegistrationStatus,
  ValidationSource,
} from '@prisma/client'
import { CreateRaceInput } from '@/actions/race/race.types'

export type AdminUpdateRaceInput = Partial<CreateRaceInput> & {
  id: string
  organizerId?: string
  status?: RaceStatus
}

export type AdminUpdateRegistrationInput = Partial<{
  status: RegistrationStatus
  statusReason: string | null
  rank: number | null
  totalTimeSeconds: number | null
  validatedAt: Date | null
  finishedAt: Date | null
  statusUpdatedBy: string
  validationSource: ValidationSource
}>

export const raceAdminService = {
  async createRace(
    data: CreateRaceInput & { organizerId: string },
    adminId: string
  ): Promise<{ id: string }> {
    return db.race.create({
      data: {
        ...data,
        status: RaceStatus.ACTIVE,
        adminValidatedAt: new Date(),
        adminValidatedById: adminId,
      },
      select: { id: true },
    })
  },

  async updateRace(data: AdminUpdateRaceInput): Promise<{ id: string }> {
    const { id, ...rest } = data
    return db.race.update({
      where: { id },
      data: rest as Prisma.RaceUpdateInput,
      select: { id: true },
    })
  },

  async searchUsers(query: string) {
    if (!query.trim()) return []
    return db.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { pseudo: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        pseudo: true,
      },
      take: 10,
      orderBy: { firstName: 'asc' },
    })
  },

  async updateRegistration(id: string, data: AdminUpdateRegistrationInput) {
    return db.raceRegistration.update({ where: { id }, data })
  },

  async createRegistration(raceId: string, userId: string) {
    const race = await db.race.findUnique({
      where: { id: raceId },
      select: {
        maxParticipants: true,
        _count: { select: { registrations: true } },
      },
    })
    if (!race) throw new Error('race_not_found')

    if (
      race.maxParticipants !== null &&
      race._count.registrations >= race.maxParticipants
    ) {
      throw new Error('race_full')
    }

    const existing = await db.raceRegistration.findUnique({
      where: { raceId_userId: { raceId, userId } },
      select: { id: true },
    })
    if (existing) throw new Error('already_registered')

    return db.raceRegistration.create({
      data: {
        raceId,
        userId,
        status: RegistrationStatus.REGISTERED,
      },
      select: { id: true },
    })
  },

  async deleteRegistration(id: string) {
    return db.raceRegistration.delete({ where: { id } })
  },
}
