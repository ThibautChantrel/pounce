import { PoiType } from '@prisma/client'

export const PoisValues = {
  Metro: 'METRO',
  Monument: 'MONUMENT',
  Park: 'PARK',
  Restaurant: 'RESTAURANT',
  Viewpoint: 'VIEWPOINT',
  Other: 'OTHER',
}

export const PoiTypeOptions = [
  { label: 'Metro', value: PoisValues.Metro },
  { label: 'Monument', value: PoisValues.Monument },
  { label: 'Park', value: PoisValues.Park },
  { label: 'Restaurant', value: PoisValues.Restaurant },
  { label: 'Viewpoint', value: PoisValues.Viewpoint },
  { label: 'Other', value: PoisValues.Other },
]

export const PoiTypeVariants: Record<
  PoiType,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  METRO: 'secondary',
  MONUMENT: 'default',
  PARK: 'outline',
  RESTAURANT: 'destructive',
  VIEWPOINT: 'default', // Ou une autre variante personnalisée
  OTHER: 'secondary',
}

export const getPoiTypeOptions = () => [
  { label: 'Métro', value: PoiType.METRO },
  { label: 'Monument', value: PoiType.MONUMENT },
  { label: 'Parc', value: PoiType.PARK },
  { label: 'Restaurant', value: PoiType.RESTAURANT },
  { label: 'Point de vue', value: PoiType.VIEWPOINT },
  { label: 'Autre', value: PoiType.OTHER },
]
