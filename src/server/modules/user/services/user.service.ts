import * as userRepository from '@/server/modules/user/repositories/user.repository'
import bcrypt from 'bcryptjs'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import { Gender } from '@prisma/client'
import { z } from 'zod'
import { RegisterSchema } from '@/actions/auth/auth.schema'

type RegisterInput = z.infer<typeof RegisterSchema>

export const registerUser = async (data: RegisterInput) => {
  const {
    email,
    password,
    pseudo,
    firstName,
    lastName,
    nationality,
    gender,
    birthDate,
    height,
    weight,
  } = data

  const existingEmail = await userRepository.findUserByEmail(email)
  if (existingEmail) {
    throw new BusinessError(
      ERROR_CODES.USER_ALREADY_EXISTS,
      'Un compte existe déjà avec cet email'
    )
  }

  const existingPseudo = await userRepository.findUserByPseudo(pseudo)
  if (existingPseudo) {
    throw new BusinessError(
      ERROR_CODES.PSEUDO_TAKEN,
      'Ce pseudo est déjà utilisé'
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
    pseudo,
    firstName,
    lastName,
    nationality,
    gender: gender as Gender,
    birthDate: new Date(birthDate),
    height: height ? Number(height) : null,
    weight: weight ? Number(weight) : null,
  })

  const { password: _, ...userWithoutPassword } = newUser
  return userWithoutPassword
}
