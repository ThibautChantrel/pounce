import { Difficulty } from '@prisma/client'

export const getDifficultyColor = (diff: Difficulty) => {
  switch (diff) {
    case 'EASY':
      return 'bg-[color:var(--difficulty-easy)] hover:opacity-90'

    case 'MEDIUM':
      return 'bg-[color:var(--difficulty-medium)] hover:opacity-90'

    case 'HARD':
      return 'bg-[color:var(--difficulty-hard)] hover:opacity-90'

    case 'EXPERT':
      return 'bg-[color:var(--difficulty-expert)] hover:opacity-90'

    default:
      return 'bg-primary'
  }
}
