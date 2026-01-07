import { BusinessError, ERROR_CODES } from '@/core/errors'
import { getOne } from '../repositories/file.repository'

export const getFileById = async (id: string) => {
  const file = await getOne(id)
  if (!file) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, 'File not found')
  }
  return file
}
