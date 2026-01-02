'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors' // <--- Import
import {
  getAllUsers,
  deleteUserById,
  getUserById,
} from '@/server/modules/user/service/user.service'

export const fetchUsers = async (skip = 0, take = 10, search?: string) => {
  return await getAllUsers(skip, take, search)
}

export const removeUser = async (id: string) => {
  const user = await getUserById(id)
  if (!user) {
    throw new BusinessError(
      ERROR_CODES.USER_DOES_NOT_EXIST,
      "L'utilisateur n'existe pas"
    )
  }
  return await deleteUserById(id)
}
