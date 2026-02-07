import { BusinessError, ERROR_CODES } from '@/core/errors'
import { auth } from '../../auth/auth.config'
import { CreateChallengeInput, UpdateChallengeInput } from '../challenge.type'
import { challengeRepository } from '../repositories/challenge.repository'
import { FetchParams } from '@/utils/fetch'

class ChallengeService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id)
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    return session.user.id
  }

  async create(data: CreateChallengeInput) {
    const userId = await this.getAuthenticatedUserId()
    return await challengeRepository.create(data, userId)
  }

  async update(data: UpdateChallengeInput) {
    const userId = await this.getAuthenticatedUserId()
    return await challengeRepository.update(data, userId)
  }

  async delete(id: string) {
    await this.getAuthenticatedUserId()
    return await challengeRepository.delete(id)
  }

  async get(id: string) {
    return await challengeRepository.findById(id)
  }

  async getAllChallenges(params: FetchParams) {
    return await challengeRepository.getAll(params)
  }
}

export const challengeService = new ChallengeService()
