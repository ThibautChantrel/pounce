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

/**
 * Petite fonction de test pour vérifier la connexion
 */
export const countUsers = async () => {
  return await db.user.count()
}
