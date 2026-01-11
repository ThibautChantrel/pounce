import db from '@/server/db'
import { Prisma } from '@prisma/client'

/**
 * Trouve un utilisateur par son email.
 * Retourne null si aucun utilisateur n'est trouvé.
 */
export const findUserByEmail = async (email: string) => {
  return await db.user.findUnique({
    where: { email },
  })
}

/**
 * Crée un nouvel utilisateur en base.
 */
export const createUser = async (data: Prisma.UserCreateInput) => {
  return await db.user.create({
    data,
  })
}

export const getAll = async (skip: number, take: number, search?: string) => {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {}

  const [users, count] = await db.$transaction([
    db.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count({ where }),
  ])

  return {
    data: users,
    total: count,
  }
}

export const deleteUserById = async (id: string) => {
  return await db.user.delete({
    where: { id },
  })
}

export const getOne = async (id: string) => {
  return await db.user.findUnique({
    where: { id },
  })
}

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return await db.user.update({
    where: { id },
    data,
  })
}
