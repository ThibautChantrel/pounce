'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { feedbackService } from '@/server/modules/feedback/services/feedback.service'
import { CreateFeedbackDTO } from './feedback.types'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

type ActionResponse = {
  success: boolean
  error?: string
  code?: string
}

export async function createFeedbackAction(
  data: CreateFeedbackDTO
): Promise<ActionResponse> {
  const t = await getTranslations('Feedbacks')
  const createFeedbackSchema = z.object({
    email: z.string().email(t('validation.emailInvalid')),
    message: z.string().min(10, t('validation.messageTooShort')),
    subscribeToUpdates: z.boolean().default(false),
  })
  const parsed = createFeedbackSchema.safeParse(data)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0].message

    return {
      success: false,
      error: firstError,
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    const { email } = parsed.data

    const countFeedbacks = await feedbackService.getCountByEmail(email)

    if (countFeedbacks >= 10) {
      return {
        success: false,
        error: t('validation.toManyFeedbacks'),
        code: 'RATE_LIMIT_EXCEEDED',
      }
    }

    await feedbackService.createFeedback(parsed.data)

    revalidatePath('/admin/feedbacks')

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la création du feedback:', error)
    return {
      success: false,
      error: "Une erreur est survenue lors de l'envoi de votre message.",
      code: 'INTERNAL_SERVER_ERROR',
    }
  }
}
