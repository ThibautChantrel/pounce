import { BusinessError, ERROR_CODES } from '@/core/errors'
import * as userRepository from '@/server/modules/user/repositories/user.repository'
import { FetchParams } from '@/utils/fetch'
import bcrypt from 'bcryptjs'
import { Gender } from '@prisma/client'

export const getAllUsers = async (params: FetchParams) => {
  return await userRepository.getAll(params)
}

export const deleteUserById = async (id: string) => {
  return await userRepository.deleteUserById(id)
}

export const getUserById = async (id: string) => {
  return await userRepository.getOne(id)
}

export const updateUserById = async (id: string, formData: FormData) => {
  const user = await userRepository.getOne(id)
  if (!user) throw new Error('User not found')

  const email = formData.get('email') as string
  const pseudo = formData.get('pseudo') as string | null
  const firstName = formData.get('firstName') as string | null
  const lastName = formData.get('lastName') as string | null
  const nationality = formData.get('nationality') as string | null
  const gender = formData.get('gender') as string | null
  const birthDate = formData.get('birthDate') as string | null
  const height = formData.get('height') as string | null
  const weight = formData.get('weight') as string | null
  const role = formData.get('role') as 'USER' | 'ADMIN'
  const isVerified = formData.get('isVerified') === 'true'
  const isCertified = formData.get('isCertified') === 'true'
  const emailVerified = formData.get('emailVerified') as string | null

  return await userRepository.updateUser(id, {
    email,
    pseudo: pseudo || null,
    firstName: firstName || null,
    lastName: lastName || null,
    nationality: nationality || null,
    gender: (gender as Gender) || null,
    birthDate: birthDate ? new Date(birthDate) : null,
    height: height ? parseInt(height) : null,
    weight: weight ? parseFloat(weight) : null,
    role,
    isVerified,
    isCertified,
    emailVerified: emailVerified ? new Date(emailVerified) : null,
  })
}

export const resetUserPassword = async (id: string, newPassword: string) => {
  const user = await userRepository.getOne(id)
  if (!user) throw new Error('User not found')

  if (newPassword.length < 6) {
    throw new BusinessError(
      ERROR_CODES.PASSWORD_TOO_WEAK,
      'Le mot de passe doit contenir au moins 6 caractères'
    )
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  return await userRepository.updateUser(id, { password: hashed })
}

export const createUser = async (formData: FormData) => {
  const email = formData.get('email') as string
  const pseudo = formData.get('pseudo') as string
  const role = formData.get('role') as 'USER' | 'ADMIN'

  const existingUser = await userRepository.findUserByEmail(email)
  if (existingUser) {
    throw new BusinessError(
      ERROR_CODES.USER_ALREADY_EXISTS,
      "L'utilisateur existe déjà"
    )
  }

  return await userRepository.createUser({ email, pseudo, role })
}
