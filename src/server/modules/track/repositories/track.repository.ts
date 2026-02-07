import prisma from '@/server/db'
import { Prisma } from '@prisma/client'
import { CreateTrackInput, UpdateTrackInput } from '../track.types'
import { fileSelectNoData } from '../../file/file.types'
import { FetchParams } from '@/utils/fetch'
const defaultInclude = {
  cover: {
    select: fileSelectNoData,
  },
  banner: {
    select: fileSelectNoData,
  },
  gpxFile: {
    select: fileSelectNoData,
  },
  _count: {
    select: { pois: true },
  },
} satisfies Prisma.TrackInclude

export class TrackRepository {
  async create(data: CreateTrackInput, userId: string) {
    const { coverId, bannerId, gpxFileId, ...rest } = data

    return await prisma.track.create({
      data: {
        ...rest,
        cover: coverId ? { connect: { id: coverId } } : undefined,
        banner: bannerId ? { connect: { id: bannerId } } : undefined,
        gpxFile: gpxFileId ? { connect: { id: gpxFileId } } : undefined,

        createdBy: {
          connect: { id: userId },
        },
      },
      include: defaultInclude,
    })
  }

  async update(data: UpdateTrackInput, userId: string) {
    const { id, poiIds, ...fields } = data

    return await prisma.track.update({
      where: { id },
      data: {
        ...fields,

        updatedById: userId,

        pois: poiIds
          ? {
              set: poiIds.map((pId: string) => ({ id: pId })),
            }
          : undefined,
      },
      include: defaultInclude,
    })
  }

  async delete(id: string) {
    return await prisma.track.delete({
      where: { id },
    })
  }

  async findById(id: string) {
    return await prisma.track.findUnique({
      where: { id },
      include: {
        ...defaultInclude,
        pois: true,
        challenges: {
          include: {
            challenge: true,
          },
        },
      },
    })
  }

  getAll = async ({ skip, take, search, orderBy }: FetchParams) => {
    const where: Prisma.TrackWhereInput = search
      ? {
          OR: [
            {
              title: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {}
    const finalOrderBy = orderBy?.length ? orderBy : [{ createdAt: 'desc' }]

    const [data, total] = await prisma.$transaction([
      prisma.track.findMany({
        where,
        skip,
        take,
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: finalOrderBy as any,
      }),
      prisma.track.count({ where }),
    ])

    return { data, total }
  }

  async findAllSimple() {
    return await prisma.track.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    })
  }

  async findGpxContent(trackId: string) {
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: {
        gpxFile: {
          select: {
            filename: true,
            mimeType: true,
            data: true,
            size: true,
          },
        },
      },
    })

    return track?.gpxFile
  }
}

export const trackRepository = new TrackRepository()
