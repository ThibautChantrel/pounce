import {
  Bike,
  Footprints,
  Mountain,
  Waves,
  Zap,
  PersonStanding,
  Tag,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ['trail'], icon: Footprints },
  { keywords: ['running', 'course', 'run'], icon: Zap },
  {
    keywords: ['vélo', 'velo', 'cycling', 'bike', 'cyclisme', 'bicyclette'],
    icon: Bike,
  },
  {
    keywords: ['randonnée', 'rando', 'hiking', 'marche', 'trekking', 'trek'],
    icon: Mountain,
  },
  { keywords: ['natation', 'swimming', 'nage'], icon: Waves },
  { keywords: ['walking', 'walk', 'balade'], icon: PersonStanding },
]

export function getCategoryIcon(value: string): LucideIcon {
  const lower = value.toLowerCase()
  for (const { keywords, icon } of ICON_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return icon
  }
  return Tag
}
