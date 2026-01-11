import { BusinessError, ERROR_CODES } from '@/core/errors'
import * as userRepository from '@/server/modules/user/repositories/user.repository'

export const getAllUsers = async (skip = 0, take = 10, search?: string) => {
  return await userRepository.getAll(skip, take, search)
}

export const deleteUserById = async (id: string) => {
  return await userRepository.deleteUserById(id)
}

export const getUserById = async (id: string) => {
  return await userRepository.getOne(id)
}

export const updateUserById = async (id: string, formData: FormData) => {
  const user = await userRepository.getOne(id)
  if (!user) {
    throw new Error('User not found')
  }

  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string as 'USER' | 'ADMIN'
  const emailVerified = formData.get('verifiedAt') as string | null

  return await userRepository.updateUser(id, {
    email,
    name,
    role,
    emailVerified: emailVerified ? new Date(emailVerified) : null,
  })
}

export const createUser = async (formData: FormData) => {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string as 'USER' | 'ADMIN'

  const existingUser = await userRepository.findUserByEmail(email)
  if (existingUser) {
    throw new BusinessError(
      ERROR_CODES.USER_ALREADY_EXISTS,
      "L'utilisateur existe déjà"
    )
  }

  return await userRepository.createUser({
    email,
    name,
    role,
  })
}
