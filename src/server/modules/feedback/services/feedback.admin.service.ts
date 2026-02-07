import { auth } from '@/server/modules/auth/auth.config'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import { FetchParams } from '@/utils/fetch'
import { feedbackRepository } from '../repositories/feedback.repository'
import { Feedback } from '@prisma/client'

export class FeedbackService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id)
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    return session.user.id
  }

  getAllFeedbacks = async (params: FetchParams) => {
    return await feedbackRepository.getAll(params)
  }

  async get(id: string): Promise<Feedback | null> {
    return await feedbackRepository.get(id)
  }
}

export const feedbackService = new FeedbackService()
