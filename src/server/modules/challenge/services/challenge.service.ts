import { auth } from '../../auth/auth.config'
import { challengeRepository } from '../repositories/challenge.repository'

class ChallengeUserService {
  async getForUser(id: string) {
    const session = await auth()
    return await challengeRepository.findByIdForUser(
      id,
      !!session?.user.role && session.user.role === 'ADMIN'
    )
  }

  async getAllChallengesForUser(
    skip: number,
    take: number,
    search?: string,
    categoryIds?: string[]
  ) {
    const session = await auth()
    return await challengeRepository.getAllForUser(
      skip,
      take,
      search,
      !!session?.user.role && session.user.role === 'ADMIN',
      categoryIds
    )
  }
}

export const challengeUserService = new ChallengeUserService()
