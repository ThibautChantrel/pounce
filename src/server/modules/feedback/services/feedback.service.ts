import { CreateFeedbackInput, Feedback } from '../feedback.type'
import { feedbackRepository } from '../repositories/feedback.repository'

export class FeedbackService {
  async createFeedback(data: CreateFeedbackInput): Promise<Feedback> {
    return await feedbackRepository.create(data)
  }

  async get(id: string): Promise<Feedback | null> {
    return await feedbackRepository.get(id)
  }

  async getCountByEmail(email: string): Promise<number> {
    return await feedbackRepository.getCountByEmail(email)
  }
}

export const feedbackService = new FeedbackService()
