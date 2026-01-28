import { ChallengeTrack } from '@prisma/client'
import { FileData } from '../file/file.admin.type'
import { Poi } from '../poi/poi.admin.type'

export type Track = {
  id: string
  title: string
  description: string | null
  visible: boolean
  distance: number
  elevationGain: number
  coverId: string | null
  bannerId: string | null
  gpxFileId: string | null
  createdAt: Date
  updatedAt: Date
  createdById: string | null
  updatedById: string | null
}
export type TrackWithRelations = Track & {
  cover: FileData | null
  banner: FileData | null
  gpxFile: FileData | null
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
