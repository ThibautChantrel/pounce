import { auth } from '@/server/modules/auth/auth.config'
import { NextRequest, NextResponse } from 'next/server'
import db from '@/server/db'
import { fetchStravaActivity } from '@/server/modules/strava/strava.client'
import { decodePolyline } from '@/server/modules/strava/track-matching.service'
import { parseGpxAndCalculateDistances } from '@/utils/geo'

type Params = { params: Promise<{ raceId: string; registrationId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { raceId, registrationId } = await params

  const race = await db.race.findUnique({
    where: { id: raceId },
    select: {
      organizerId: true,
      track: {
        select: { id: true, gpxFile: true },
      },
    },
  })

  if (!race) {
    return NextResponse.json({ error: 'Race not found' }, { status: 404 })
  }

  const isOrganizer = race.organizerId === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isOrganizer && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const reg = await db.raceRegistration.findUnique({
    where: { id: registrationId },
    select: {
      userId: true,
      stravaActivityId: true,
      user: { select: { firstName: true, lastName: true, pseudo: true } },
    },
  })

  if (!reg?.stravaActivityId) {
    return NextResponse.json(
      { error: 'No Strava activity linked' },
      { status: 404 }
    )
  }

  let activityPoints: { lat: number; lon: number }[] = []
  let activityName = ''
  try {
    const activity = await fetchStravaActivity(reg.userId, reg.stravaActivityId)
    const polyline = activity.map?.summary_polyline
    if (polyline) {
      activityPoints = decodePolyline(polyline).map((p) => ({
        lat: p.lat,
        lon: p.lon,
      }))
    }
    activityName = activity.name
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch Strava activity' },
      { status: 502 }
    )
  }

  let referencePoints: { lat: number; lon: number }[] = []
  if (race.track.gpxFile) {
    const gpxString = Buffer.from(race.track.gpxFile.data).toString('utf-8')
    referencePoints = parseGpxAndCalculateDistances(gpxString).map((p) => ({
      lat: p.lat,
      lon: p.lon,
    }))
  }

  const userName =
    `${reg.user.firstName ?? ''} ${reg.user.lastName ?? ''}`.trim() ||
    reg.user.pseudo ||
    'Participant'

  return NextResponse.json({
    userName,
    activityName,
    activityPoints,
    referencePoints,
  })
}
