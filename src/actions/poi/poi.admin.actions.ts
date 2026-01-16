'use server'

import { BusinessError } from '@/core/errors'
import { CreatePoiInput, UpdatePoiInput } from '@/server/poi/poi.types'
import { poiService } from '@/server/poi/services/poi.admin.service'
import { revalidatePath } from 'next/cache'

type ActionResponse = {
  success: boolean
  error?: string
  code?: string
  data?: string
}

export async function createPoiAction(
  data: CreatePoiInput
): Promise<ActionResponse> {
  try {
    const res = await poiService.create(data)
    revalidatePath(`/admin/poids/${res.id}`)
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

    return { success: false, error: error.message }
  }
}

export async function updatePoiAction(
  data: UpdatePoiInput
): Promise<ActionResponse> {
  try {
    const poi = await poiService.update(data)
    revalidatePath(`/admin/pois/${poi.id}`)
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
    return { success: false, error: error.message }
  }
}

export async function deletePoiAction(id: string): Promise<ActionResponse> {
  try {
    await poiService.delete(id)
    revalidatePath(`/admin/pois`)
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
    return { success: false, error: error.message }
  }
}

export const fetchPois = async (skip = 0, take = 10, search?: string) => {
  return await poiService.getAllPois(skip, take, search)
}
