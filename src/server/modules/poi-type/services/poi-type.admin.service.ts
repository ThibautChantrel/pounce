import { BusinessError, ERROR_CODES } from '@/core/errors'
import { auth } from '../../auth/auth.config'
import { CreatePoiTypeInput, UpdatePoiTypeInput } from '../poi-type.types'
import { poiTypeRepository } from '../repositories/poi-type.repository'
import { FetchParams } from '@/utils/fetch'

class PoiTypeService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id)
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    return session.user.id
  }

  async create(data: CreatePoiTypeInput) {
    const userId = await this.getAuthenticatedUserId()
    return await poiTypeRepository.create(data, userId)
  }

  async update(data: UpdatePoiTypeInput) {
    const userId = await this.getAuthenticatedUserId()
    return await poiTypeRepository.update(data, userId)
  }

  async delete(id: string) {
    await this.getAuthenticatedUserId()
    return await poiTypeRepository.delete(id)
  }

  async get(id: string) {
    return await poiTypeRepository.findById(id)
  }

  async getAll(params: FetchParams) {
    return await poiTypeRepository.getAll(params)
  }

  async getAllForSelect(params: {
    skip: number
    take: number
    search?: string
  }) {
    return await poiTypeRepository.getAllForSelect(params)
  }
}

export const poiTypeService = new PoiTypeService()
