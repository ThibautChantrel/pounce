import { PoiType } from '@prisma/client'

export type PoiTypeWithRelations = PoiType

export type CreatePoiTypeInput = {
  value: string
  description?: string | null
}

export type UpdatePoiTypeInput = Partial<CreatePoiTypeInput> & {
  id: string
}
