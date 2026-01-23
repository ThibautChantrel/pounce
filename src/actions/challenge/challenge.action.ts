'use server'

import { challengeService } from '@/server/modules/challenge/services/challenge.service'
import { ChallengeWithRelations } from './challenge.admin.type'

export async function fetchChallenges(
  skip = 0,
  take = 10,
  search?: string
): Promise<{ data: ChallengeWithRelations[]; total: number }> {
  return await challengeService.getAllChallengesForUser(skip, take, search)
}
