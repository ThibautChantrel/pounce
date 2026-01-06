import * as userRepository from '@/server/modules/user/repository/user.repository'

export const getAllUsers = async (skip = 0, take = 10, search?: string) => {
  return await userRepository.getAll(skip, take, search)
}

export const deleteUserById = async (id: string) => {
  return await userRepository.deleteUserById(id)
}

export const getUserById = async (id: string) => {
  return await userRepository.getOne(id)
}
