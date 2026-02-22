'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors'
import { feedbackAdminService } from '@/server/modules/feedback/services/feedback.admin.service'
import { FetchParams } from '@/utils/fetch'

export async function getFeedbackAction(id: string) {
  const feedback = await feedbackAdminService.get(id)
  if (!feedback) {
    throw new BusinessError(
      ERROR_CODES.FEEDBACK_DOES_NOT_EXIST,
      "Le feedback n'existe pas"
    )
  }
  await feedbackAdminService.markAsRead(id)
  return feedback
}

export const fetchFeedbacks = async (params: FetchParams) => {
  return await feedbackAdminService.getAllFeedbacks(params)
}
