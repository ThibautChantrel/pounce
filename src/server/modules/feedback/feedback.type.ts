export type Feedback = {
  id: string
  email: string
  message: string
  isRead: boolean
  subscribeToUpdates: boolean
  createdAt: Date
}

export type CreateFeedbackInput = {
  email: string
  message: string
  subscribeToUpdates: boolean
}
