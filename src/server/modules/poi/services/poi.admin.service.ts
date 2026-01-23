import { auth } from '@/server/modules/auth/auth.config'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import { poiRepository } from '../repositories/poi.repository'
import { CreatePoiInput, Poi, UpdatePoiInput } from '../poi.types'

export class PoiService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id)
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    return session.user.id
  }

  async create(data: CreatePoiInput) {
    const userId = await this.getAuthenticatedUserId()
    console.log('OKOKOK')

    const duplicate = await poiRepository.findByName(data.name)

    if (duplicate)
      throw new BusinessError(
        ERROR_CODES.POI_SAME_NAME_ALREADY_EXISTS,
        'Action Impossible, il existe déjà un poi avec le même name'
      )
    return await poiRepository.create(data, userId)
  }

  async update(data: UpdatePoiInput) {
    const userId = await this.getAuthenticatedUserId()
    const existing = await poiRepository.findById(data.id)
    if (!existing)
      throw new BusinessError(ERROR_CODES.NOT_FOUND, 'POI introuvable')
    if (data.name && data.name != existing.name) {
      const duplicates = await poiRepository.findMultipleByName(data.name)
      if (duplicates.length > 2)
        throw new BusinessError(
          ERROR_CODES.POI_SAME_NAME_ALREADY_EXISTS,
          'Action Impossible, il existe déjà un poi avec le même name'
        )
    }
    return await poiRepository.update(data, userId)
  }

  async delete(id: string) {
    await this.getAuthenticatedUserId()
    return await poiRepository.delete(id)
  }

  getAllPois = async (skip = 0, take = 10, search?: string) => {
    return await poiRepository.getAll(skip, take, search)
  }

  async get(id: string): Promise<Poi | null> {
    return await poiRepository.findById(id)
  }
}

export const poiService = new PoiService()
