import db from '@/server/db'
import { fetchStravaActivity } from './strava.client'
import { matchActivityToTrack } from './track-matching.service'

type CertifyResult = {
  certifiedTrackIds: string[]
  certifiedChallengeIds: string[]
  skippedTrackIds: string[]
}

/**
 * Processes a Strava activity event for a given user.
 * Matches the activity against all visible tracks that have a GPX file.
 * Creates TrackCertification and ChallengeCertification records as appropriate.
 */
export async function processStravaActivity(
  userId: string,
  stravaActivityId: string
): Promise<CertifyResult> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user?.isVerified) {
    return {
      certifiedTrackIds: [],
      certifiedChallengeIds: [],
      skippedTrackIds: [],
    }
  }

  const activity = await fetchStravaActivity(userId, stravaActivityId)
  const polyline = activity.map?.summary_polyline
  if (!polyline) {
    return {
      certifiedTrackIds: [],
      certifiedChallengeIds: [],
      skippedTrackIds: [],
    }
  }

  const tracks = await db.track.findMany({
    where: { visible: true, gpxFileId: { not: null } },
    include: { gpxFile: true },
  })

  const certifiedTrackIds: string[] = []
  const skippedTrackIds: string[] = []

  for (const track of tracks) {
    if (!track.gpxFile) continue

    // Skip if this activity already certified this track
    const existing = await db.trackCertification.findUnique({
      where: {
        stravaActivityId_trackId: { stravaActivityId, trackId: track.id },
      },
    })
    if (existing) {
      skippedTrackIds.push(track.id)
      continue
    }

    const gpxString = Buffer.from(track.gpxFile.data).toString('utf-8')
    const result = matchActivityToTrack(polyline, gpxString)

    if (!result.matched) continue

    const avgSpeedKmh = activity.average_speed * 3.6
    const completedAt = new Date(activity.start_date)

    await db.trackCertification.create({
      data: {
        userId,
        trackId: track.id,
        stravaActivityId,
        avgSpeed: avgSpeedKmh,
        totalTime: activity.moving_time,
        completedAt,
      },
    })

    certifiedTrackIds.push(track.id)
  }

  const certifiedChallengeIds = await checkAndCertifyChallenges(
    userId,
    certifiedTrackIds
  )

  return { certifiedTrackIds, certifiedChallengeIds, skippedTrackIds }
}

/**
 * After certifying tracks, checks if any challenge is now fully completed.
 * Creates ChallengeCertification records where all tracks are certified.
 */
async function checkAndCertifyChallenges(
  userId: string,
  newlyCompletedTrackIds: string[]
): Promise<string[]> {
  if (newlyCompletedTrackIds.length === 0) return []

  // Find challenges that include at least one newly certified track
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
      where: {
        userId,
        trackId: { in: trackIds },
        isValid: true,
      },
    })

    if (completedCount < trackIds.length) continue

    const mostRecentTrack = await db.trackCertification.findFirst({
      where: { userId, trackId: { in: trackIds }, isValid: true },
      orderBy: { completedAt: 'desc' },
    })

    await db.challengeCertification.create({
      data: {
        userId,
        challengeId: challenge.id,
        completedAt: mostRecentTrack?.completedAt ?? new Date(),
      },
    })

    certifiedChallengeIds.push(challenge.id)
  }

  return certifiedChallengeIds
}
