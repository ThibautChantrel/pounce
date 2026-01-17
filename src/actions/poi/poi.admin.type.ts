import { PoiType } from '@prisma/client'

export type Poi = {
  id: string
  name: string
  type: PoiType
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
  description: string | null
  createdById: string | null
  updatedById: string | null
}
