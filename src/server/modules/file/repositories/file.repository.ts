import db from '@/server/db'
import { Prisma } from '@prisma/client'

export const createFile = async (input: Prisma.FileCreateInput) => {
  const cleanBuffer = new Uint8Array(input.data as unknown as ArrayBufferLike)

  const userId = input.createdBy?.connect?.id

  if (!userId) {
    throw new Error("L'utilisateur (createdBy) est manquant")
  }

  return db.file.create({
    data: {
      // 3. Mappage MANUEL (Interdiction d'utiliser ...rest ou spread operator)
      filename: input.filename,
      mimeType: input.mimeType,
      size: input.size,
      data: cleanBuffer, // On passe le Uint8Array propre
      createdBy: {
        connect: { id: userId },
      },
    },
    select: {
      id: true,
      filename: true,
      size: true,
      mimeType: true,
    },
  })
}

export const getOne = (id: string) => {
  return db.file.findUnique({
    where: { id },
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
