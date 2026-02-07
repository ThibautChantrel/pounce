import { auth } from '@/server/modules/auth/auth.config'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import {
  createFile,
  deleteFile,
  getAll,
  getOne,
  getOneInfo,
  updateFile,
} from '../repositories/file.repository'
import { Prisma } from '@prisma/client'
import { FetchParams } from '@/utils/fetch'

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

export const getFileInfosById = async (id: string) => {
  const file = await getOneInfo(id)
  if (!file) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, 'File not found')
  }
  return file
}

export const getAllFiles = async (params: FetchParams) => {
  return await getAll(params)
}

export const deleteFileById = async (id: string) => {
  const file = await getOne(id)
  if (!file) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, 'File not found')
  }
  return await deleteFile(id)
}

export const updateFileById = async (id: string, formData: FormData) => {
  const existingFile = await getOne(id)
  if (!existingFile) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, 'File not found')
  }

  const dataToUpdate: Prisma.FileUpdateInput = {}

  const file = formData.get('file') as File | null
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())

    dataToUpdate.data = buffer
    dataToUpdate.size = buffer.length
    dataToUpdate.mimeType = file.type
    dataToUpdate.filename = file.name
  }

  const filenameInput = formData.get('filename') as string | null
  if (filenameInput && filenameInput.trim() !== '') {
    dataToUpdate.filename = filenameInput
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return existingFile
  }

  return await updateFile(id, dataToUpdate)
}
