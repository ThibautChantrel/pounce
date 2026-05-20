import db from '@/server/db'
import { FetchParams } from '@/utils/fetch'
import { Prisma } from '@prisma/client'

export const findUserByEmail = async (email: string) => {
  return await db.user.findUnique({ where: { email } })
}

export const findUserByPseudo = async (pseudo: string) => {
  return await db.user.findUnique({ where: { pseudo } })
}

export const createUser = async (data: Prisma.UserCreateInput) => {
  return await db.user.create({ data })
}

export const getAll = async ({ skip, take, search, orderBy }: FetchParams) => {
  const where = search
    ? {
        OR: [
          { pseudo: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            firstName: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
          {
            lastName: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {}

  const finalOrderBy = orderBy?.length ? orderBy : [{ createdAt: 'desc' }]

  const [users, count] = await db.$transaction([
    db.user.findMany({
      where,
      skip,
      take,
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy: finalOrderBy as any,
    }),
    db.user.count({ where }),
  ])

  return { data: users, total: count }
}

export const deleteUserById = async (id: string) => {
  return await db.user.delete({ where: { id } })
}

export const getOne = async (id: string) => {
  return await db.user.findUnique({ where: { id } })
}

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return await db.user.update({ where: { id }, data })
}
