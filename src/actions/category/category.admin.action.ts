'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors'
import { categoryService } from '@/server/modules/category/services/category.admin.service'
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/server/modules/category/category.types'
import { revalidatePath } from 'next/cache'
import { FetchParams } from '@/utils/fetch'

type ActionResponse = {
  success: boolean
  error?: string
  code?: string
  data?: string
}

export async function createCategoryAction(
  data: CreateCategoryInput
): Promise<ActionResponse> {
  try {
    const res = await categoryService.create(data)
    revalidatePath(`/admin/categories`)
    return { success: true, data: res.id }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    throw error
  }
}

export async function updateCategoryAction(
  data: UpdateCategoryInput
): Promise<ActionResponse> {
  try {
    const category = await categoryService.update(data)
    revalidatePath(`/admin/categories/${category.id}`)
    revalidatePath(`/admin/categories`)
    return { success: true }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    throw error
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<ActionResponse> {
  try {
    await categoryService.delete(id)
    revalidatePath(`/admin/categories`)
    return { success: true }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    throw error
  }
}

export async function getCategoryAction(id: string) {
  const category = await categoryService.get(id)
  if (!category) {
    throw new BusinessError(ERROR_CODES.NOT_FOUND, "La catégorie n'existe pas")
  }
  return category
}

export const fetchCategories = async (params: FetchParams) => {
  return await categoryService.getAllCategories(params)
}

export const fetchCategoriesForSelect = async (params: {
  skip: number
  take: number
  search?: string
}) => {
  return await categoryService.getAllForSelect(params)
}
