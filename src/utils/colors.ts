import { Difficulty } from '@prisma/client'

export const getDifficultyColor = (diff: Difficulty) => {
  switch (diff) {
    case 'EASY':
      return 'bg-emerald-500 hover:bg-emerald-600'
    case 'MEDIUM':
      return 'bg-blue-500 hover:bg-blue-600'
    case 'HARD':
      return 'bg-orange-500 hover:bg-orange-600'
    case 'EXPERT':
      return 'bg-red-600 hover:bg-red-700'
    default:
      return 'bg-primary'
  }
}
