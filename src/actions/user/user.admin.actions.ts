'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors' // <--- Import
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from '@/server/modules/user/services/user.admin.service'
import { revalidatePath } from 'next/cache'

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

export const getUser = async (id: string) => {
  const user = await getUserById(id)
  if (!user) {
    throw new BusinessError(
      ERROR_CODES.USER_DOES_NOT_EXIST,
      "L'utilisateur n'existe pas"
    )
  }
  return user
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    await updateUserById(id, formData)

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${id}`)

    return { success: true }
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

export async function createUserAction(formData: FormData) {
  try {
    const user = await createUser(formData)

    revalidatePath('/admin/users')

    return { success: true, data: user }
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message }
    }
    return {
      success: false,
      error: 'Erreur inconnue lors de la création de l’utilisateur',
    }
  }
}
