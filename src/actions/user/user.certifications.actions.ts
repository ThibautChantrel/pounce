'use server'

import { auth } from '@/server/modules/auth/auth.config'
import db from '@/server/db'
import type {
  SyncActivityLog,
  SyncDetails,
} from '@/server/modules/strava/sync-log.types'

export type CompletedChallenge = {
  id: string
  completedAt: Date
  activityMode: string
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
  distance: number
  elevationGain: number
  activityType: string
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

export type UnreadCertificationSummary = {
  trackCertificationIds: string[]
  challengeCertificationIds: string[]
  trackTitles: string[]
  challengeTitles: string[]
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
      activityMode: cert.activityMode,
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
    distance: cert.distance,
    elevationGain: cert.elevationGain,
    activityType: cert.activityType,
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

export type UnmatchedActivity = {
  activityId: string
  provider: string
  activityName: string | null
  activityType: string | null
  distance: number | null
  elevationGain: number | null
  completedAt: string | null
  syncedAt: Date
  source: string
}

export async function fetchUserUnmatchedActivities(): Promise<
  UnmatchedActivity[]
> {
  const session = await auth()
  if (!session?.user?.id) return []

  const recentSyncs = await db.activitySync.findMany({
    where: { userId: session.user.id },
    orderBy: { syncedAt: 'desc' },
    take: 5,
  })

  const seen = new Set<string>()
  const result: UnmatchedActivity[] = []

  for (const sync of recentSyncs) {
    const details = sync.details as unknown as SyncDetails
    const activities: SyncActivityLog[] = details?.activities ?? []

    for (const activity of activities) {
      if (activity.status !== 'no_match') continue
      if (seen.has(activity.activityId)) continue
      seen.add(activity.activityId)

      result.push({
        activityId: activity.activityId,
        provider: sync.provider,
        activityName: activity.activityName ?? null,
        activityType: activity.activityType ?? null,
        distance: activity.distance ?? null,
        elevationGain: activity.elevationGain ?? null,
        completedAt: activity.completedAt ?? null,
        syncedAt: sync.syncedAt,
        source: sync.source,
      })
    }
  }

  return result
}

export async function fetchUnreadCertifications(): Promise<UnreadCertificationSummary> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      trackCertificationIds: [],
      challengeCertificationIds: [],
      trackTitles: [],
      challengeTitles: [],
    }
  }

  const [trackCerts, challengeCerts] = await Promise.all([
    db.trackCertification.findMany({
      where: { userId: session.user.id, isValid: true, isRead: false },
      select: {
        id: true,
        track: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
    }),
    db.challengeCertification.findMany({
      where: { userId: session.user.id, isValid: true, isRead: false },
      select: {
        id: true,
        challenge: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
    }),
  ])

  return {
    trackCertificationIds: trackCerts.map((c) => c.id),
    challengeCertificationIds: challengeCerts.map((c) => c.id),
    trackTitles: trackCerts.map((c) => c.track.title),
    challengeTitles: challengeCerts.map((c) => c.challenge.title),
  }
}

export async function markCertificationsAsRead(input: {
  trackCertificationIds: string[]
  challengeCertificationIds: string[]
}): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false }

  await Promise.all([
    input.trackCertificationIds.length
      ? db.trackCertification.updateMany({
          where: {
            id: { in: input.trackCertificationIds },
            userId: session.user.id,
          },
          data: { isRead: true },
        })
      : Promise.resolve(),
    input.challengeCertificationIds.length
      ? db.challengeCertification.updateMany({
          where: {
            id: { in: input.challengeCertificationIds },
            userId: session.user.id,
          },
          data: { isRead: true },
        })
      : Promise.resolve(),
  ])

  return { success: true }
}
