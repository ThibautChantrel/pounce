import { Prisma } from '@prisma/client'
export type fileWithoutData = {
  id: string
  filename: string
  mimeType: string
  size: number
  createdAt: Date
  updatedAt: Date
  createdById: string
}

export const fileSelectNoData = {
  id: true,
  filename: true,
  mimeType: true,
  size: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
} satisfies Prisma.FileSelect
