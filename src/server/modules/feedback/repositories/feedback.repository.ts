import prisma from '@/server/db'
import { CreateFeedbackInput } from '../feedback.type'
import { FetchParams } from '@/utils/fetch'
import { Prisma } from '@prisma/client'

export class FeedBackRepository {
  async create(data: CreateFeedbackInput) {
    return await prisma.feedback.create({
      data,
    })
  }

  async get(id: string) {
    return prisma.feedback.findUnique({
      where: { id },
    })
  }

  async markAsRead(id: string) {
    return prisma.feedback.update({
      where: { id },
      data: { isRead: true },
    })
  }

  async getCountByEmail(email: string) {
    return prisma.feedback.count({
      where: { email },
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
              email: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          ],
        }
      : {}
    const finalOrderBy = orderBy?.length ? orderBy : [{ createdAt: 'desc' }]

    const [data, total] = await prisma.$transaction([
      prisma.feedback.findMany({
        where,
        skip,
        take,
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderBy: finalOrderBy as any,
      }),
      prisma.feedback.count({ where }),
    ])
    return { data, total }
  }
}

export const feedbackRepository = new FeedBackRepository()
