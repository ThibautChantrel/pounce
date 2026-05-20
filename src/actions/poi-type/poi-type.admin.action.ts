'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors'
import { poiTypeService } from '@/server/modules/poi-type/services/poi-type.admin.service'
import {
  CreatePoiTypeInput,
  UpdatePoiTypeInput,
} from '@/server/modules/poi-type/poi-type.types'
import { revalidatePath } from 'next/cache'
import { FetchParams } from '@/utils/fetch'

type ActionResponse = {
  success: boolean
  error?: string
  code?: string
  data?: string
}

export async function createPoiTypeAction(
  data: CreatePoiTypeInput
): Promise<ActionResponse> {
  try {
    const res = await poiTypeService.create(data)
    revalidatePath('/admin/poi-types')
    return { success: true, data: res.id }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    throw error
  }
}

export async function updatePoiTypeAction(
  data: UpdatePoiTypeInput
): Promise<ActionResponse> {
  try {
    const poiType = await poiTypeService.update(data)
    revalidatePath(`/admin/poi-types/${poiType.id}`)
    revalidatePath('/admin/poi-types')
    return { success: true }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    throw error
  }
}

export async function deletePoiTypeAction(id: string): Promise<ActionResponse> {
  try {
    await poiTypeService.delete(id)
    revalidatePath('/admin/poi-types')
    return { success: true }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    throw error
  }
}

export async function getPoiTypeAction(id: string) {
  const poiType = await poiTypeService.get(id)
  if (!poiType) {
    throw new BusinessError(
      ERROR_CODES.NOT_FOUND,
      "Le type de POI n'existe pas"
    )
  }
  return poiType
}

export const fetchPoiTypes = async (params: FetchParams) => {
  return await poiTypeService.getAll(params)
}

export const fetchPoiTypesForSelect = async (params: {
  skip: number
  take: number
  search?: string
}) => {
  return await poiTypeService.getAllForSelect(params)
}
