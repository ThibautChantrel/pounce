'use server'

import { challengeUserService } from '@/server/modules/challenge/services/challenge.service'
import { ChallengeWithRelations } from './challenge.admin.type'

export async function fetchChallengesForUser(
  skip = 0,
  take = 10,
  search?: string,
  categoryIds?: string[]
): Promise<{ data: ChallengeWithRelations[]; total: number }> {
  return await challengeUserService.getAllChallengesForUser(
    skip,
    take,
    search,
    categoryIds
  )
}

export async function getChallengeForUserAction(id: string) {
  try {
    return await challengeUserService.getForUser(id)
  } catch (error) {
    throw error
  }
}
