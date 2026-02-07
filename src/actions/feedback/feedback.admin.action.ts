'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors'
import { feedbackService } from '@/server/modules/feedback/services/feedback.admin.service'
import { FetchParams } from '@/utils/fetch'

export async function getFeedbackAction(id: string) {
  const user = await feedbackService.get(id)
  if (!user) {
    throw new BusinessError(
      ERROR_CODES.FEEDBACK_DOES_NOT_EXIST,
      "Le feedback n'existe pas"
    )
  }
  return user
}

export const fetchFeedbacks = async (params: FetchParams) => {
  return await feedbackService.getAllFeedbacks(params)
}
