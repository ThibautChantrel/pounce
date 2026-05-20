import { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

export const PoiTypeVariants: Record<string, BadgeVariant> = {
  METRO: 'default',
  MONUMENT: 'secondary',
  PARK: 'outline',
  RESTAURANT: 'destructive',
  VIEWPOINT: 'outline',
  OTHER: 'secondary',
}

export function getPoiTypeVariant(typeValue?: string | null): BadgeVariant {
  if (!typeValue) return 'secondary'
  return PoiTypeVariants[typeValue] || 'secondary'
}
