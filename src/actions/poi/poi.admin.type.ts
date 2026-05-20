export type Poi = {
  id: string
  name: string
  typeId: string | null
  type?: { id: string; value: string } | null
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
  description: string | null
  createdById: string | null
  updatedById: string | null
}
