import db from '@/server/db'
import {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return db.race.update({
      where: { id },
      data: rest as any,
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

  async deleteRegistration(id: string) {
    return db.raceRegistration.delete({ where: { id } })
  },
}
