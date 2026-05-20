export type CreatePoiInput = {
  name: string
  description?: string
  typeId?: string | null
  latitude: number
  longitude: number
}

export type UpdatePoiInput = Partial<CreatePoiInput> & {
  id: string
}

export type PoiWithType = {
  id: string
  name: string
  typeId: string | null
  type: { id: string; value: string } | null
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
  description: string | null
  createdById: string | null
  updatedById: string | null
}

export type CreateManyPoiInput = CreatePoiInput & {
  createdById?: string | null
}
