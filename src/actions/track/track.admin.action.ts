'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors'
import { trackService } from '@/server/modules/track/services/track.admin.service'
import {
  CreateTrackInput,
  UpdateTrackInput,
} from '@/server/modules/track/track.types'
import { revalidatePath } from 'next/cache'
import { TrackWithRelations } from './track.admin.types'

type ActionResponse = {
  success: boolean
  error?: string
  code?: string
  data?: string
}

export async function createTrackAction(
  data: CreateTrackInput
): Promise<ActionResponse> {
  try {
    const res = await trackService.create(data)
    revalidatePath(`/admin/tracks`)
    return { success: true, data: res.id }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      console.log('Erreur Métier :', error.code)
      return {
        success: false,
        error: error.message,
        code: error.code,
      }
    }
    throw error
  }
}

export async function updateTrackAction(
  data: UpdateTrackInput
): Promise<ActionResponse> {
  try {
    const track = await trackService.update(data)

    revalidatePath(`/admin/tracks/${track.id}`)
    revalidatePath(`/admin/tracks`)

    return { success: true }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      console.log('Erreur Métier :', error.code)
      return {
        success: false,
        error: error.message,
        code: error.code,
      }
    }
    throw error
  }
}

export async function deleteTrackAction(id: string): Promise<ActionResponse> {
  try {
    await trackService.delete(id)
    revalidatePath(`/admin/tracks`)
    return { success: true }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      console.log('Erreur Métier :', error.code)
      return {
        success: false,
        error: error.message,
        code: error.code,
      }
    }
    throw error
  }
}

export async function getTrackAction(id: string): Promise<TrackWithRelations> {
  const track = await trackService.get(id)
  if (!track) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, "Le parcours n'existe pas")
  }
  return track
}

export const fetchTracks = async (skip = 0, take = 10, search?: string) => {
  return await trackService.getAllTracks(skip, take, search)
}
