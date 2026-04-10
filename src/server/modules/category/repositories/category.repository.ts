import prisma from '@/server/db'
import { Prisma } from '@prisma/client'
import { CreateCategoryInput, UpdateCategoryInput } from '../category.types'
import { FetchParams } from '@/utils/fetch'

export class CategoryRepository {
  async create(data: CreateCategoryInput, userId: string) {
    return await prisma.category.create({
      data: {
        ...data,
        createdBy: { connect: { id: userId } },
      },
    })
  }

  async update(data: UpdateCategoryInput, userId: string) {
    const { id, ...fields } = data

    return await prisma.category.update({
      where: { id },
      data: {
        ...fields,
        updatedById: userId,
      },
    })
  }

  async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    })
  }

  async findById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
    })
  }

  getAll = async ({ skip, take, search, orderBy }: FetchParams) => {
    const where: Prisma.CategoryWhereInput = search
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
      prisma.category.findMany({
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
      prisma.category.count({ where }),
    ])

    return { data, total }
  }

  async getAllForSelect(params: {
    skip: number
    take: number
    search?: string
  }) {
    const where: Prisma.CategoryWhereInput = params.search
      ? {
          value: {
            contains: params.search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}

    const [data, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { value: 'asc' },
        select: { id: true, value: true },
      }),
      prisma.category.count({ where }),
    ])

    return { data, total }
  }
}

export const categoryRepository = new CategoryRepository()
