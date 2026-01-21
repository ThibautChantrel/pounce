import { CreateChallengeInput, UpdateChallengeInput } from '../challenge.type'
import { challengeRepository } from '../repositories/challenge.repository'

class ChallengeService {
  async create(data: CreateChallengeInput, userId: string = 'system') {
    return await challengeRepository.create(data, userId)
  }

  async update(data: UpdateChallengeInput, userId: string = 'system') {
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
