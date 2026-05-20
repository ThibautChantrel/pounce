import prisma from '@/server/db'
import { Prisma } from '@prisma/client'
import { CreatePoiTypeInput, UpdatePoiTypeInput } from '../poi-type.types'
import { FetchParams } from '@/utils/fetch'

export class PoiTypeRepository {
  async create(data: CreatePoiTypeInput, userId: string) {
    return await prisma.poiType.create({
      data: {
        ...data,
        createdBy: { connect: { id: userId } },
      },
    })
  }

  async update(data: UpdatePoiTypeInput, userId: string) {
    const { id, ...fields } = data
    return await prisma.poiType.update({
      where: { id },
      data: {
        ...fields,
        updatedById: userId,
      },
    })
  }

  async delete(id: string) {
    return await prisma.poiType.delete({ where: { id } })
  }

  async findById(id: string) {
    return await prisma.poiType.findUnique({ where: { id } })
  }

  async findByValue(value: string) {
    return await prisma.poiType.findUnique({ where: { value } })
  }

  getAll = async ({ skip, take, search, orderBy }: FetchParams) => {
    const where: Prisma.PoiTypeWhereInput = search
      ? {
          OR: [
            { value: { contains: search, mode: Prisma.QueryMode.insensitive } },
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
      prisma.poiType.findMany({
        where,
        skip,
        take,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: finalOrderBy as any,
        select: {
          id: true,
          value: true,
          description: true,
          createdAt: true,
        },
      }),
      prisma.poiType.count({ where }),
    ])

    return { data, total }
  }

  async getAllForSelect(params: {
    skip: number
    take: number
    search?: string
  }) {
    const where: Prisma.PoiTypeWhereInput = params.search
      ? {
          value: {
            contains: params.search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}

    const [data, total] = await prisma.$transaction([
      prisma.poiType.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { value: 'asc' },
        select: { id: true, value: true },
      }),
      prisma.poiType.count({ where }),
    ])

    return { data, total }
  }
}

export const poiTypeRepository = new PoiTypeRepository()
