import { ActivityMode } from '@prisma/client'
import db from '@/server/db'
import { fetchStravaActivity } from './strava.client'
import { matchActivityToTrack } from './track-matching.service'
import { SyncActivityLog, SyncMatchedTrack } from './sync-log.types'

const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun', 'Hike', 'Walk'])
const RIDE_TYPES = new Set([
  'Ride',
  'GravelRide',
  'MountainBikeRide',
  'VirtualRide',
  'EBikeRide',
  'EMountainBikeRide',
  'Handcycle',
  'Velomobile',
])

function classifyType(activityType: string): 'run' | 'ride' | 'other' {
  if (RUN_TYPES.has(activityType)) return 'run'
  if (RIDE_TYPES.has(activityType)) return 'ride'
  return 'other'
}

function deriveActivityMode(activityTypes: string[]): ActivityMode {
  const categories = new Set(activityTypes.map(classifyType))
  if (categories.size === 1) {
    const cat = [...categories][0]
    if (cat === 'run') return ActivityMode.RUN
    if (cat === 'ride') return ActivityMode.RIDE
  }
  if (categories.size > 1) return ActivityMode.HYBRID
  return ActivityMode.OTHER
}

export type ProcessActivityResult = {
  activityLog: SyncActivityLog
  certifiedTrackIds: string[]
  certifiedChallengeIds: string[]
}

export async function processStravaActivity(
  userId: string,
  stravaActivityId: string
): Promise<ProcessActivityResult> {
  const empty = (
    status: SyncActivityLog['status'],
    activityName: string | null = null,
    errorMessage: string | null = null,
    activityType: string | null = null,
    distance: number | null = null,
    elevationGain: number | null = null,
    completedAt: string | null = null
  ): ProcessActivityResult => ({
    activityLog: {
      activityId: stravaActivityId,
      activityName,
      activityType,
      distance,
      elevationGain,
      completedAt,
      status,
      matchedTracks: [],
      errorMessage,
    },
    certifiedTrackIds: [],
    certifiedChallengeIds: [],
  })

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user?.isVerified) return empty('error', null, 'user_not_verified')

  let activity
  try {
    activity = await fetchStravaActivity(userId, stravaActivityId)
  } catch (err) {
    return empty(
      'error',
      null,
      err instanceof Error ? err.message : 'fetch_failed'
    )
  }

  const activityType = activity.sport_type ?? activity.type ?? 'unknown'
  const activityDistance = activity.distance / 1000
  const activityElevation = activity.total_elevation_gain
  const activityDate = activity.start_date

  const polyline = activity.map?.summary_polyline
  if (!polyline)
    return empty(
      'no_polyline',
      activity.name ?? null,
      null,
      activityType,
      activityDistance,
      activityElevation,
      activityDate
    )

  const tracks = await db.track.findMany({
    where: { visible: true, gpxFileId: { not: null } },
    include: { gpxFile: true },
  })

  const certifiedTrackIds: string[] = []
  const matchedTracks: SyncMatchedTrack[] = []
  let hasSkipped = false

  for (const track of tracks) {
    if (!track.gpxFile) continue

    const existing = await db.trackCertification.findUnique({
      where: {
        provider_activityId_trackId: {
          provider: 'strava',
          activityId: stravaActivityId,
          trackId: track.id,
        },
      },
    })
    if (existing) {
      hasSkipped = true
      continue
    }

    const gpxString = Buffer.from(track.gpxFile.data).toString('utf-8')
    const result = matchActivityToTrack(polyline, gpxString)

    if (!result.matched) continue

    const avgSpeedKmh = activity.average_speed * 3.6
    const maxSpeedKmh = activity.max_speed * 3.6
    const completedAt = new Date(activity.start_date)

    await db.trackCertification.create({
      data: {
        userId,
        trackId: track.id,
        provider: 'strava',
        activityId: stravaActivityId,
        activityType,
        avgSpeed: avgSpeedKmh,
        maxSpeed: maxSpeedKmh > 0 ? maxSpeedKmh : null,
        totalTime: activity.moving_time,
        distance: activity.distance / 1000,
        elevationGain: activity.total_elevation_gain,
        heartRateAvg: activity.average_heartrate
          ? Math.round(activity.average_heartrate)
          : null,
        heartRateMax: activity.max_heartrate
          ? Math.round(activity.max_heartrate)
          : null,
        calories: activity.calories ?? null,
        completedAt,
      },
    })

    certifiedTrackIds.push(track.id)
    matchedTracks.push({
      trackId: track.id,
      trackTitle: track.title,
      matchedPoints: result.matchedPoints,
      totalPoints: result.totalPoints,
      direction: result.direction as 'forward' | 'backward',
    })
  }

  const certifiedChallengeIds = await checkAndCertifyChallenges(
    userId,
    certifiedTrackIds
  )

  const status: SyncActivityLog['status'] =
    matchedTracks.length > 0 ? 'matched' : hasSkipped ? 'skipped' : 'no_match'

  return {
    activityLog: {
      activityId: stravaActivityId,
      activityName: activity.name ?? null,
      activityType,
      distance: activityDistance,
      elevationGain: activityElevation,
      completedAt: activityDate,
      status,
      matchedTracks,
      errorMessage: null,
    },
    certifiedTrackIds,
    certifiedChallengeIds,
  }
}

async function checkAndCertifyChallenges(
  userId: string,
  newlyCompletedTrackIds: string[]
): Promise<string[]> {
  if (newlyCompletedTrackIds.length === 0) return []

  const candidateChallenges = await db.challenge.findMany({
    where: {
      visible: true,
      tracks: { some: { trackId: { in: newlyCompletedTrackIds } } },
      certifications: { none: { userId } },
    },
    include: { tracks: true },
  })

  const certifiedChallengeIds: string[] = []

  for (const challenge of candidateChallenges) {
    const trackIds = challenge.tracks.map((ct) => ct.trackId)

    const completedCount = await db.trackCertification.count({
      where: { userId, trackId: { in: trackIds }, isValid: true },
    })

    if (completedCount < trackIds.length) continue

    const trackCerts = await db.trackCertification.findMany({
      where: { userId, trackId: { in: trackIds }, isValid: true },
      select: { activityType: true, completedAt: true },
      orderBy: { completedAt: 'desc' },
    })

    const activityMode = deriveActivityMode(
      trackCerts.map((c) => c.activityType)
    )
    const completedAt = trackCerts[0]?.completedAt ?? new Date()

    await db.challengeCertification.create({
      data: {
        userId,
        challengeId: challenge.id,
        completedAt,
        activityMode,
      },
    })

    certifiedChallengeIds.push(challenge.id)
  }

  return certifiedChallengeIds
}
