import { Track, ChallengeTrack } from '@prisma/client'
import { fileWithoutData } from '../file/file.types'

type PoiWithType = {
  id: string
  name: string
  description: string | null
  typeId: string | null
  type?: { id: string; value: string } | null
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
  createdById: string | null
  updatedById: string | null
}

export type TrackWithRelations = Track & {
  cover: fileWithoutData | null
  banner: fileWithoutData | null
  gpxFile: fileWithoutData | null
  pois?: PoiWithType[]
  challenges?: (ChallengeTrack & {
    challenge: { title: string }
  })[]
  categories?: { category: { id: string; value: string } }[]
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
  categoryIds?: string[]
}

export type PoiWithDistance = PoiWithType & { distanceFromStart: number }
export type TrackWithPoisDistance = Omit<TrackWithRelations, 'pois'> & {
  pois: PoiWithDistance[]
}
