import * as userRepository from '@/server/modules/user/repository/user.repository'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { BusinessError, ERROR_CODES } from '@/core/errors'

export const registerUser = async (data: Prisma.UserCreateInput) => {
  const { email, password, name } = data

  const existingUser = await userRepository.findUserByEmail(email)
  if (existingUser) {
    throw new BusinessError(
      ERROR_CODES.USER_ALREADY_EXISTS,
      "L'utilisateur existe déjà"
    )
  }

  if (!password || password.length < 6) {
    throw new BusinessError(
      ERROR_CODES.PASSWORD_TOO_WEAK,
      'Le mot de passe doit contenir au moins 6 caractères.'
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await userRepository.createUser({
    email,
    password: hashedPassword,
    name,
  })

  const { password: _, ...userWithoutPassword } = newUser

  return userWithoutPassword
}
