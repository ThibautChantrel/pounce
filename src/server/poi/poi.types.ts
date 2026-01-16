import { PoiType } from '@prisma/client'

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
