import prisma from '@/server/db'
import { CreatePoiInput, UpdatePoiInput } from '../poi.types'
import { Prisma } from '@prisma/client'
import { FetchParams } from '@/utils/fetch'

const defaultInclude = {
  type: {
    select: { id: true, value: true },
  },
} satisfies Prisma.PoiInclude

export class PoiRepository {
  async create(data: CreatePoiInput, userId: string) {
    const { typeId, ...rest } = data
    return await prisma.poi.create({
      data: {
        ...rest,
        type: typeId ? { connect: { id: typeId } } : undefined,
        createdBy: { connect: { id: userId } },
      },
      include: defaultInclude,
    })
  }

  async update(data: UpdatePoiInput, userId: string) {
    const { id, typeId, ...fields } = data
    return await prisma.poi.update({
      where: { id },
      data: {
        ...fields,
        type:
          typeId !== undefined
            ? typeId
              ? { connect: { id: typeId } }
              : { disconnect: true }
            : undefined,
        updatedBy: { connect: { id: userId } },
      },
      include: defaultInclude,
    })
  }

  async delete(id: string) {
    return await prisma.poi.delete({ where: { id } })
  }

  async findById(id: string) {
    return await prisma.poi.findUnique({
      where: { id },
      include: defaultInclude,
    })
  }

  async findByName(n: string) {
    return await prisma.poi.findFirst({ where: { name: n } })
  }

  async findMultipleByName(n: string) {
    return await prisma.poi.findMany({ where: { name: n } })
  }

  getAll = async ({ skip, take, search, orderBy }: FetchParams) => {
    const where = search
      ? {
          OR: [
            { id: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
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
        include: defaultInclude,
      }),
      prisma.poi.count({ where }),
    ])
    return { data, total }
  }

  async getExistingForValidation() {
    return await prisma.poi.findMany({
      select: { name: true, latitude: true, longitude: true },
    })
  }

  async createMany(data: Prisma.PoiCreateManyInput[]) {
    return await prisma.poi.createMany({
      data,
      skipDuplicates: true,
    })
  }
}

export const poiRepository = new PoiRepository()
