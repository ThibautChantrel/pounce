import { BusinessError, ERROR_CODES } from '@/core/errors'
import { auth } from '../../auth/auth.config'
import { CreateChallengeInput, UpdateChallengeInput } from '../challenge.type'
import { challengeRepository } from '../repositories/challenge.repository'

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
    return await challengeRepository.delete(id)
  }

  async get(id: string) {
    return await challengeRepository.findById(id)
  }

  async getAllChallenges(skip: number, take: number, search?: string) {
    return await challengeRepository.getAll(skip, take, search)
  }
}

export const challengeService = new ChallengeService()
