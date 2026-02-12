import { auth } from '@/server/modules/auth/auth.config'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import { FetchParams } from '@/utils/fetch'
import { feedbackRepository } from '../repositories/feedback.repository'
import { Feedback } from '@prisma/client'

export class FeedbackAdminService {
  private async getAuthenticatedUserId(): Promise<string> {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized')
    }
    return session.user.id
  }

  getAllFeedbacks = async (params: FetchParams) => {
    await this.getAuthenticatedUserId()
    return await feedbackRepository.getAll(params)
  }

  async get(id: string): Promise<Feedback | null> {
    await this.getAuthenticatedUserId()
    return await feedbackRepository.get(id)
  }

  async markAsRead(id: string) {
    await this.getAuthenticatedUserId()
    return await feedbackRepository.markAsRead(id)
  }
}

export const feedbackAdminService = new FeedbackAdminService()
