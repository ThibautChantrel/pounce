import db from '@/server/db'
import { Prisma } from '@prisma/client'

export const createFile = (data: Prisma.FileCreateInput) => {
  return db.file.create({
    data,

    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
    },
  })
}

export const getOne = (id: string) => {
  return db.file.findUnique({
    where: { id },
  })
}

export const getOneInfo = (id: string) => {
  return db.file.findUnique({
    where: { id },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      // data: true
    },
  })
}

export const updateFile = (id: string, data: Prisma.FileUpdateInput) => {
  return db.file.update({
    where: { id },
    data,
  })
}

export const deleteFile = (id: string) => {
  return db.file.delete({
    where: { id },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
    },
  })
}

export const getAll = async (skip: number, take: number, search?: string) => {
  const where = search
    ? {
        OR: [
          {
            filename: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
          {
            createdBy: {
              email: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          },
          {
            createdBy: {
              name: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
          },
        ],
      }
    : {}

  const [data, total] = await db.$transaction([
    db.file.findMany({
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    db.file.count({ where }),
  ])
  return { data, total }
}
