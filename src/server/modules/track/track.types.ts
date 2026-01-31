import { Track, Poi, ChallengeTrack } from '@prisma/client'
import { fileWithoutData } from '../file/file.types'

export type TrackWithRelations = Track & {
  cover: fileWithoutData | null
  banner: fileWithoutData | null
  gpxFile: fileWithoutData | null
  pois?: Poi[]
  challenges?: (ChallengeTrack & {
    challenge: { title: string }
  })[]
  _count?: {
    pois: number
  }
}

// 2. Input pour la création
export type CreateTrackInput = {
  title: string
  description?: string
  visible?: boolean
  distance: number
  elevationGain: number
  coverId?: string
  bannerId?: string
  gpxFileId?: string
}

// 3. Input pour la mise à jour
// On prend CreateTrackInput, on rend tout optionnel, et on ajoute l'ID obligatoire
export type UpdateTrackInput = Partial<CreateTrackInput> & {
  id: string

  // On autorise explicitement 'null' pour pouvoir supprimer une image ou un fichier
  coverId?: string | null
  bannerId?: string | null
  gpxFileId?: string | null
  poiIds?: string[]
}

export type PoiWithDistance = Poi & { distanceFromStart: number }
export type TrackWithPoisDistance = Omit<TrackWithRelations, 'pois'> & {
  pois: PoiWithDistance[]
}
