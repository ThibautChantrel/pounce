'use server'

import {
  deleteFileById,
  getAllFiles,
  getFileById,
  upload,
} from '@/server/modules/file/services/file.admin.service'

export type FileData = {
  id: string
  filename: string
  mimeType: string
  size: number
  createdAt: Date
  createdBy?: {
    name: string | null
    email: string
  } | null
}

export async function uploadFileAction(formData: FormData) {
  return await upload(formData)
}

export async function getFile(id: string): Promise<FileData> {
  return getFileById(id)
}

export const fetchFiles = async (skip = 0, take = 10, search?: string) => {
  return await getAllFiles(skip, take, search)
}

export const removeFile = async (id: string) => {
  return await deleteFileById(id)
}

export const updateFile = async (id: string, formData: FormData) => {
  return await upload(formData)
}
