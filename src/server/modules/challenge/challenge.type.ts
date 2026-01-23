import { Challenge, ChallengeTrack, Track, Difficulty } from '@prisma/client'
import { fileWithoutData } from '../file/file.types'

export type ChallengeWithRelations = Challenge & {
  cover: fileWithoutData | null
  banner: fileWithoutData | null
  tracks: (ChallengeTrack & {
    track: Track
  })[]
}

export type CreateChallengeInput = {
  title: string
  description?: string | null
  visible?: boolean
  location: string
  difficulty: Difficulty
  coverId?: string | null
  bannerId?: string | null

  trackIds?: string[]
}

// Input de mise à jour
export type UpdateChallengeInput = Partial<CreateChallengeInput> & {
  id: string
  // Redéclaration explicite pour autoriser le null/undefined dans le partiel
  coverId?: string | null
  bannerId?: string | null
  trackIds?: string[]
}
