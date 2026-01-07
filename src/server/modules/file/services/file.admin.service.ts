import { auth } from '@/server/modules/auth/auth.config'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import {
  createFile,
  deleteFile,
  getAll,
  getOne,
} from '../repositories/file.repository'

export const upload = async (formData: FormData) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new BusinessError(
      ERROR_CODES.UNAUTHORIZED,
      'User must be authenticated to upload files'
    )
  }

  const file = formData.get('file') as File | null
  if (!file) {
    throw new Error('No file provided')
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  return createFile({
    filename: file.name,
    mimeType: file.type,
    size: buffer.length,
    data: buffer,
    createdBy: {
      connect: { id: session.user.id },
    },
  })
}

export const getFileById = async (id: string) => {
  const file = await getOne(id)
  if (!file) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, 'File not found')
  }
  return file
}

export const getAllFiles = async (skip = 0, take = 10, search?: string) => {
  return await getAll(skip, take, search)
}

export const deleteFileById = async (id: string) => {
  const file = await getOne(id)
  if (!file) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, 'File not found')
  }
  return await deleteFile(id)
}
