import { fileWithoutData } from '@/server/modules/file/file.types'
import { Difficulty } from '@prisma/client'
import { Track } from '../track/track.types'

export type Challenge = {
  id: string
  title: string
  description: string | null
  visible: boolean
  location: string
  difficulty: Difficulty
  coverId: string | null
  bannerId: string | null
  createdAt: Date
  updatedAt: Date
  createdById: string | null
  updatedById: string | null
}

export type ChallengeTrack = {
  id: string
  challengeId: string
  trackId: string
  order: number
}

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

export type UpdateChallengeInput = Partial<CreateChallengeInput> & {
  id: string
  coverId?: string | null
  bannerId?: string | null
  trackIds?: string[]
}
