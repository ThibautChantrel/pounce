import prisma from '@/server/db'
import { CreatePoiInput, UpdatePoiInput } from '../poi.types'
import { Prisma } from '@prisma/client'
import { FetchParams } from '@/utils/fetch'

export class PoiRepository {
  async create(data: CreatePoiInput, userId: string) {
    const { ...rest } = data
    console.log(data)
    return await prisma.poi.create({
      data: {
        ...rest,
        createdBy: {
          connect: { id: userId },
        },
      },
    })
  }

  async update(data: UpdatePoiInput, userId: string) {
    const { id, ...fields } = data
    return await prisma.poi.update({
      where: { id },
      data: {
        ...fields,
        updatedBy: { connect: { id: userId } },
      },
    })
  }

  async delete(id: string) {
    return await prisma.poi.delete({
      where: { id },
    })
  }

  async findById(id: string) {
    return await prisma.poi.findUnique({
      where: { id },
    })
  }

  async findByName(n: string) {
    return await prisma.poi.findFirst({
      where: { name: n },
    })
  }

  async findMultipleByName(n: string) {
    return await prisma.poi.findMany({
      where: { name: n },
    })
  }

  getAll = async ({ skip, take, search, orderBy }: FetchParams) => {
    const where = search
      ? {
          OR: [
            {
              id: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          ],
        }
      : {}
    const finalOrderBy = orderBy?.length ? orderBy : [{ createdAt: 'desc' }]

    const [data, total] = await prisma.$transaction([
      prisma.poi.findMany({
        where,
        skip,
        take,
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: finalOrderBy as any,
      }),
      prisma.poi.count({ where }),
    ])
    return { data, total }
  }
}

export const poiRepository = new PoiRepository()
