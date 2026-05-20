import { Category } from '@prisma/client'

export type CategoryWithRelations = Category

export type CreateCategoryInput = {
  value: string
  description?: string | null
}

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  id: string
}
