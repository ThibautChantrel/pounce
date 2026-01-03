'use server'

import {
  deleteFileById,
  getAllFiles,
  getFileById,
  upload,
} from '@/server/modules/file/service/file.service'

export async function uploadFileAction(formData: FormData) {
  await upload(formData)
}

export async function getFileAction(id: string) {
  return getFileById(id)
}

export const fetchFiles = async (skip = 0, take = 10, search?: string) => {
  return await getAllFiles(skip, take, search)
}

export const removeFile = async (id: string) => {
  return await deleteFileById(id)
}
