import { Challenge, File, Track } from '@prisma/client'

export type ChallengeWithRelations = Challenge & {
  cover: File | null
  banner: File | null
  tracks: Track[] // On veut récupérer les tracks aussi
  _count: {
    tracks: number
  }
}

export type CreateChallengeInput = {
  title: string
  description?: string
  location: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'
  coverId?: string // Optionnel à la création
  bannerId?: string
}

export type UpdateChallengeInput = {
  id: string
  title?: string
  description?: string
  location?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'

  // string = on change l'image
  // null = on supprime l'image
  // undefined = on ne touche pas
  coverId?: string | null
  bannerId?: string | null

  // Optionnel : Si tu veux mettre à jour l'ordre des tracks d'un coup
  tracksOrder?: { id: string; order: number }[]
}
