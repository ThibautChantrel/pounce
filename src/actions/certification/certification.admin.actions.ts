'use server'

import db from '@/server/db'
import { FetchParams } from '@/utils/fetch'
import { revalidatePath } from 'next/cache'

export async function fetchTrackCertifications({
  skip,
  take,
  search,
}: FetchParams) {
  const where = search
    ? {
        OR: [
          {
            track: {
              title: { contains: search, mode: 'insensitive' as const },
            },
          },
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
    : {}

  const [data, total] = await db.$transaction([
    db.trackCertification.findMany({
      where,
      skip,
      take,
      orderBy: { completedAt: 'desc' },
      include: {
        track: { select: { id: true, title: true } },
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
    db.trackCertification.count({ where }),
  ])

  return { data, total }
}

export async function fetchChallengeCertifications({
  skip,
  take,
  search,
}: FetchParams) {
  const where = search
    ? {
        OR: [
          {
            challenge: {
              title: { contains: search, mode: 'insensitive' as const },
            },
          },
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
    : {}

  const [data, total] = await db.$transaction([
    db.challengeCertification.findMany({
      where,
      skip,
      take,
      orderBy: { completedAt: 'desc' },
      include: {
        challenge: { select: { id: true, title: true } },
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
    db.challengeCertification.count({ where }),
  ])

  return { data, total }
}

export async function toggleTrackCertificationValid(id: string) {
  const cert = await db.trackCertification.findUnique({ where: { id } })
  if (!cert) throw new Error('Not found')
  await db.trackCertification.update({
    where: { id },
    data: { isValid: !cert.isValid },
  })
  revalidatePath('/admin/track-certifications')
}

export async function toggleChallengeCertificationValid(id: string) {
  const cert = await db.challengeCertification.findUnique({ where: { id } })
  if (!cert) throw new Error('Not found')
  await db.challengeCertification.update({
    where: { id },
    data: { isValid: !cert.isValid },
  })
  revalidatePath('/admin/challenge-certifications')
}

export async function deleteTrackCertification(id: string) {
  await db.trackCertification.delete({ where: { id } })
  revalidatePath('/admin/track-certifications')
}

export async function deleteChallengeCertification(id: string) {
  await db.challengeCertification.delete({ where: { id } })
  revalidatePath('/admin/challenge-certifications')
}
