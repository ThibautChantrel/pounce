'use server'

import db from '@/server/db'
import { FetchParams } from '@/utils/fetch'

export async function fetchStravaSyncs({ skip, take, search }: FetchParams) {
  const where = search
    ? {
        provider: 'strava' as const,
        OR: [
          {
            user: { email: { contains: search, mode: 'insensitive' as const } },
          },
          {
            user: {
              pseudo: { contains: search, mode: 'insensitive' as const },
            },
          },
        ],
      }
    : { provider: 'strava' as const }

  const [data, total] = await db.$transaction([
    db.activitySync.findMany({
      where,
      skip,
      take,
      orderBy: { syncedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            pseudo: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    db.activitySync.count({ where }),
  ])

  return { data, total }
}

export async function getStravaSync(id: string) {
  return db.activitySync.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          pseudo: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}
