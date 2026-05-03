import db from '@/server/db'
import { RaceStatus, Role } from '@prisma/client'
import {
  CreateRaceInput,
  RaceDetail,
  RaceSummary,
  UpdateRaceInput,
} from '@/actions/race/race.types'

const raceSelect = {
  id: true,
  title: true,
  description: true,
  activityMode: true,
  format: true,
  accessType: true,
  accessCode: true,
  status: true,
  startAt: true,
  endAt: true,
  loopDurationMinutes: true,
  maxParticipants: true,
  logoId: true,
  bannerId: true,
  adminValidatedAt: true,
  adminRejectionReason: true,
  createdAt: true,
  organizer: {
    select: { id: true, firstName: true, lastName: true, pseudo: true },
  },
  adminValidatedBy: {
    select: { id: true, firstName: true, lastName: true },
  },
  track: {
    select: {
      id: true,
      title: true,
      distance: true,
      elevationGain: true,
      coverId: true,
    },
  },
  _count: { select: { registrations: true } },
} as const

const registrationSelect = {
  id: true,
  userId: true,
  status: true,
  registeredAt: true,
  validatedAt: true,
  totalTimeSeconds: true,
  rank: true,
  validationSource: true,
  stravaActivityId: true,
  statusReason: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      pseudo: true,
      email: true,
    },
  },
  backyardLoops: {
    select: {
      id: true,
      loopNumber: true,
      status: true,
      timeSeconds: true,
      avgSpeed: true,
      completedAt: true,
      validationSource: true,
    },
    orderBy: { loopNumber: 'asc' as const },
  },
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRace(r: any): RaceSummary {
  const raw = r
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    activityMode: raw.activityMode,
    format: raw.format,
    accessType: raw.accessType,
    status: raw.status,
    startAt: raw.startAt,
    endAt: raw.endAt,
    loopDurationMinutes: raw.loopDurationMinutes ?? null,
    maxParticipants: raw.maxParticipants ?? null,
    registrationCount: raw._count?.registrations ?? 0,
    organizer: raw.organizer,
    track: raw.track,
    logoId: raw.logoId ?? null,
    bannerId: raw.bannerId ?? null,
    adminValidatedAt: raw.adminValidatedAt ?? null,
    adminRejectionReason: raw.adminRejectionReason ?? null,
    adminValidatedBy: raw.adminValidatedBy ?? null,
    createdAt: raw.createdAt,
  }
}

export const raceService = {
  async create(
    data: CreateRaceInput,
    userId: string,
    userRole: Role
  ): Promise<{ id: string }> {
    const status =
      userRole === Role.ADMIN ? RaceStatus.ACTIVE : RaceStatus.PENDING_REVIEW
    const adminValidatedAt = userRole === Role.ADMIN ? new Date() : null
    const adminValidatedById = userRole === Role.ADMIN ? userId : null

    return db.race.create({
      data: {
        ...data,
        organizerId: userId,
        status,
        adminValidatedAt,
        adminValidatedById,
      },
      select: { id: true },
    })
  },

  async update(data: UpdateRaceInput, userId: string, userRole: Role) {
    const race = await db.race.findUniqueOrThrow({
      where: { id: data.id },
      select: { organizerId: true },
    })
    if (race.organizerId !== userId && userRole !== Role.ADMIN) {
      throw new Error('Unauthorized')
    }
    const { id, ...rest } = data
    return db.race.update({ where: { id }, data: rest })
  },

  async delete(id: string, userId: string, userRole: Role) {
    const race = await db.race.findUniqueOrThrow({
      where: { id },
      select: { organizerId: true },
    })
    if (race.organizerId !== userId && userRole !== Role.ADMIN) {
      throw new Error('Unauthorized')
    }
    return db.race.delete({ where: { id } })
  },

  async getById(id: string): Promise<RaceDetail | null> {
    const race = await db.race.findUnique({
      where: { id },
      select: {
        ...raceSelect,
        registrations: {
          select: registrationSelect,
          orderBy: { registeredAt: 'asc' },
        },
      },
    })
    if (!race) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = race as any
    return {
      ...mapRace(r),
      accessCode: r.accessCode ?? null,
      registrations: r.registrations ?? [],
    } as RaceDetail
  },

  async listPublic(params: {
    skip?: number
    take?: number
    search?: string
    format?: string
    activityMode?: string
  }): Promise<{ data: RaceSummary[]; total: number }> {
    const where = {
      status: RaceStatus.ACTIVE,
      ...(params.search
        ? { title: { contains: params.search, mode: 'insensitive' as const } }
        : {}),
      ...(params.format ? { format: params.format as never } : {}),
      ...(params.activityMode
        ? { activityMode: params.activityMode as never }
        : {}),
    }
    const [data, total] = await Promise.all([
      db.race.findMany({
        where,
        select: raceSelect,
        skip: params.skip ?? 0,
        take: params.take ?? 12,
        orderBy: { startAt: 'asc' },
      }),
      db.race.count({ where }),
    ])
    return { data: data.map(mapRace), total }
  },

  async listForOrganizer(organizerId: string): Promise<RaceSummary[]> {
    const data = await db.race.findMany({
      where: { organizerId },
      select: raceSelect,
      orderBy: { createdAt: 'desc' },
    })
    return data.map(mapRace)
  },

  async listForAdmin(params: {
    skip?: number
    take?: number
    search?: string
    status?: RaceStatus
  }): Promise<{ data: RaceSummary[]; total: number }> {
    const where = {
      ...(params.search
        ? { title: { contains: params.search, mode: 'insensitive' as const } }
        : {}),
      ...(params.status ? { status: params.status } : {}),
    }
    const [data, total] = await Promise.all([
      db.race.findMany({
        where,
        select: raceSelect,
        skip: params.skip ?? 0,
        take: params.take ?? 20,
        orderBy: { createdAt: 'desc' },
      }),
      db.race.count({ where }),
    ])
    return { data: data.map(mapRace), total }
  },

  async adminValidate(id: string, adminId: string) {
    return db.race.update({
      where: { id },
      data: {
        status: RaceStatus.ACTIVE,
        adminValidatedAt: new Date(),
        adminValidatedById: adminId,
        adminRejectionReason: null,
      },
    })
  },

  async adminReject(id: string, adminId: string, reason: string) {
    return db.race.update({
      where: { id },
      data: {
        status: RaceStatus.CANCELLED,
        adminValidatedAt: new Date(),
        adminValidatedById: adminId,
        adminRejectionReason: reason,
      },
    })
  },
}
