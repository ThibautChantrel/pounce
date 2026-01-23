import prisma from '@/server/db'
import { Prisma } from '@prisma/client'
import { fileSelectNoData } from '../../file/file.types'
import { CreateChallengeInput, UpdateChallengeInput } from '../challenge.type'

const defaultInclude = {
  cover: { select: fileSelectNoData },
  banner: { select: fileSelectNoData },
  tracks: {
    orderBy: { order: 'asc' },
    include: {
      track: true,
    },
  },
} satisfies Prisma.ChallengeInclude

export class ChallengeRepository {
  async create(data: CreateChallengeInput, userId: string) {
    const { coverId, bannerId, trackIds, ...rest } = data

    return await prisma.challenge.create({
      data: {
        ...rest,
        cover: coverId ? { connect: { id: coverId } } : undefined,
        banner: bannerId ? { connect: { id: bannerId } } : undefined,

        tracks: trackIds
          ? {
              create: trackIds.map((trackId, index) => ({
                track: { connect: { id: trackId } },
                order: index,
              })),
            }
          : undefined,

        createdBy: { connect: { id: userId } },
      },
      include: defaultInclude,
    })
  }

  async update(data: UpdateChallengeInput, userId: string) {
    const { id, trackIds, ...fields } = data

    return await prisma.challenge.update({
      where: { id },
      data: {
        ...fields,
        updatedById: userId,

        tracks: trackIds
          ? {
              deleteMany: {},
              create: trackIds.map((trackId, index) => ({
                track: { connect: { id: trackId } },
                order: index,
              })),
            }
          : undefined,
      },
      include: defaultInclude,
    })
  }

  async delete(id: string) {
    return await prisma.challenge.delete({
      where: { id },
    })
  }

  async findById(id: string) {
    return await prisma.challenge.findUnique({
      where: { id },
      include: defaultInclude,
    })
  }

  getAll = async (skip: number, take: number, search?: string) => {
    const where: Prisma.ChallengeWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              location: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}

    const [data, total] = await prisma.$transaction([
      prisma.challenge.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          cover: { select: fileSelectNoData },
          _count: { select: { tracks: true } },
        },
      }),
      prisma.challenge.count({ where }),
    ])

    return { data, total }
  }

  getAllForUser = async (skip: number, take: number, search?: string) => {
    const where: Prisma.ChallengeWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              location: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}

    const [data, total] = await prisma.$transaction([
      prisma.challenge.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: defaultInclude,
      }),
      prisma.challenge.count({ where }),
    ])

    return { data, total }
  }
}

export const challengeRepository = new ChallengeRepository()
