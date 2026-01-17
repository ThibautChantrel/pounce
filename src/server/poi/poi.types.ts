import { PoiType } from '@prisma/client'

export enum PoiTypeEnum {
  Metro = 'METRO',
  Monument = 'MONUMENT',
  Park = 'PARK',
  Restaurant = 'RESTAURANT',
  Viewpoint = 'VIEWPOINT',
  Other = 'OTHER',
}

export type CreatePoiInput = {
  name: string
  description?: string
  type: PoiType
  latitude: number
  longitude: number
}

export type UpdatePoiInput = Partial<CreatePoiInput> & {
  id: string
}

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
