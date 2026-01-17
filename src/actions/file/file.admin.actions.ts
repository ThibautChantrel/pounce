'use server'

import {
  deleteFileById,
  getAllFiles,
  getFileById,
  getFileInfosById,
  updateFileById,
  upload,
} from '@/server/modules/file/services/file.admin.service'
import { revalidatePath } from 'next/cache'
import { FileData } from './file.admin.type'

export async function uploadFileAction(formData: FormData) {
  return await upload(formData)
}

export async function getFile(id: string): Promise<FileData> {
  return await getFileById(id)
}

export async function getFileInfos(id: string): Promise<FileData> {
  return await getFileInfosById(id)
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

export async function updateFileAction(id: string, formData: FormData) {
  try {
    await updateFileById(id, formData)

    // On rafraichit les données
    revalidatePath('/admin/files')
    revalidatePath(`/admin/files/${id}`)

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}
