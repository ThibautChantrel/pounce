'use server'

import { auth } from '@/server/modules/auth/auth.config'
import db from '@/server/db'

export type CompletedChallenge = {
  id: string
  completedAt: Date
  challenge: {
    id: string
    title: string
    location: string
    coverId: string | null
    trackCount: number
    totalDistance: number
  }
}

export type CompletedTrack = {
  id: string
  completedAt: Date
  avgSpeed: number
  totalTime: number
  track: {
    id: string
    title: string
    distance: number
    coverId: string | null
  }
}

export type InProgressChallenge = {
  challenge: {
    id: string
    title: string
    location: string
    coverId: string | null
    totalTracks: number
    totalDistance: number
  }
  completedCount: number
}

export type UserProfileStats = {
  completedChallenges: CompletedChallenge[]
  completedTracks: CompletedTrack[]
  inProgressChallenges: InProgressChallenge[]
}

// For the carousel: challengeId -> completed track count + whether user is logged in
export async function fetchUserChallengeData(): Promise<{
  isLoggedIn: boolean
  progressMap: Record<string, number>
}> {
  const session = await auth()
  if (!session?.user?.id) return { isLoggedIn: false, progressMap: {} }

  const certs = await db.trackCertification.findMany({
    where: { userId: session.user.id, isValid: true },
    select: {
      track: {
        select: { challenges: { select: { challengeId: true } } },
      },
    },
  })

  const progressMap: Record<string, number> = {}
  for (const cert of certs) {
    for (const ct of cert.track.challenges) {
      progressMap[ct.challengeId] = (progressMap[ct.challengeId] ?? 0) + 1
    }
  }

  return { isLoggedIn: true, progressMap }
}

// For challenge detail page: list of certified trackIds for current user
export async function fetchUserCertifiedTrackIds(): Promise<string[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const certs = await db.trackCertification.findMany({
    where: { userId: session.user.id, isValid: true },
    select: { trackId: true },
  })

  return certs.map((c) => c.trackId)
}

// For the profile page: full stats
export async function fetchUserProfileStats(): Promise<UserProfileStats> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      completedChallenges: [],
      completedTracks: [],
      inProgressChallenges: [],
    }
  }

  const userId = session.user.id

  const [challengeCerts, trackCerts] = await Promise.all([
    db.challengeCertification.findMany({
      where: { userId, isValid: true },
      orderBy: { completedAt: 'desc' },
      include: {
        challenge: {
          include: {
            tracks: { include: { track: { select: { distance: true } } } },
          },
        },
      },
    }),
    db.trackCertification.findMany({
      where: { userId, isValid: true },
      orderBy: { completedAt: 'desc' },
      include: {
        track: {
          select: { id: true, title: true, distance: true, coverId: true },
        },
      },
    }),
  ])

  const completedChallenges: CompletedChallenge[] = challengeCerts.map(
    (cert) => ({
      id: cert.id,
      completedAt: cert.completedAt,
      challenge: {
        id: cert.challenge.id,
        title: cert.challenge.title,
        location: cert.challenge.location,
        coverId: cert.challenge.coverId,
        trackCount: cert.challenge.tracks.length,
        totalDistance: cert.challenge.tracks.reduce(
          (acc, t) => acc + t.track.distance,
          0
        ),
      },
    })
  )

  const completedChallengeIds = challengeCerts.map((c) => c.challengeId)
  const certifiedTrackIds = trackCerts.map((c) => c.trackId)

  const completedTracks: CompletedTrack[] = trackCerts.map((cert) => ({
    id: cert.id,
    completedAt: cert.completedAt,
    avgSpeed: cert.avgSpeed,
    totalTime: cert.totalTime,
    track: cert.track,
  }))

  const candidateChallenges = await db.challenge.findMany({
    where: {
      visible: true,
      id: { notIn: completedChallengeIds },
      tracks: { some: { trackId: { in: certifiedTrackIds } } },
    },
    include: {
      tracks: { include: { track: { select: { id: true, distance: true } } } },
    },
  })

  const inProgressChallenges: InProgressChallenge[] = candidateChallenges
    .map((challenge) => {
      const trackIds = challenge.tracks.map((t) => t.trackId)
      const completedCount = trackIds.filter((id) =>
        certifiedTrackIds.includes(id)
      ).length
      return {
        challenge: {
          id: challenge.id,
          title: challenge.title,
          location: challenge.location,
          coverId: challenge.coverId,
          totalTracks: trackIds.length,
          totalDistance: challenge.tracks.reduce(
            (acc, t) => acc + t.track.distance,
            0
          ),
        },
        completedCount,
      }
    })
    .filter((c) => c.completedCount > 0)
    .sort(
      (a, b) =>
        b.completedCount / b.challenge.totalTracks -
        a.completedCount / a.challenge.totalTracks
    )

  return { completedChallenges, completedTracks, inProgressChallenges }
}
