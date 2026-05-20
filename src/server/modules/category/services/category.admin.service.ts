import { BusinessError, ERROR_CODES } from '@/core/errors'
import { auth } from '../../auth/auth.config'
import { CreateCategoryInput, UpdateCategoryInput } from '../category.types'
import { categoryRepository } from '../repositories/category.repository'
import { FetchParams } from '@/utils/fetch'

class CategoryService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id)
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    return session.user.id
  }

  async create(data: CreateCategoryInput) {
    const userId = await this.getAuthenticatedUserId()
    return await categoryRepository.create(data, userId)
  }

  async update(data: UpdateCategoryInput) {
    const userId = await this.getAuthenticatedUserId()
    return await categoryRepository.update(data, userId)
  }

  async delete(id: string) {
    await this.getAuthenticatedUserId()
    return await categoryRepository.delete(id)
  }

  async get(id: string) {
    return await categoryRepository.findById(id)
  }

  async getAllCategories(params: FetchParams) {
    return await categoryRepository.getAll(params)
  }

  async getAllForSelect(params: {
    skip: number
    take: number
    search?: string
  }) {
    return await categoryRepository.getAllForSelect(params)
  }
}

export const categoryService = new CategoryService()
