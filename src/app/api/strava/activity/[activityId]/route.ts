import { auth } from '@/server/modules/auth/auth.config'
import { NextRequest, NextResponse } from 'next/server'
import { fetchStravaActivity } from '@/server/modules/strava/strava.client'
import { decodePolyline } from '@/server/modules/strava/track-matching.service'
import db from '@/server/db'

type Params = { params: Promise<{ activityId: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { activityId } = await params
  const userId = req.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const activity = await fetchStravaActivity(userId, activityId)
  const polyline = activity.map?.summary_polyline

  const points = polyline ? decodePolyline(polyline) : []

  // If a trackId is provided, also return the reference GPX points
  const trackId = req.nextUrl.searchParams.get('trackId')
  let referencePoints: { lat: number; lon: number }[] = []

  if (trackId) {
    const track = await db.track.findUnique({
      where: { id: trackId },
      include: { gpxFile: true },
    })
    if (track?.gpxFile) {
      const { parseGpxAndCalculateDistances } = await import('@/utils/geo')
      const gpxString = Buffer.from(track.gpxFile.data).toString('utf-8')
      referencePoints = parseGpxAndCalculateDistances(gpxString).map((p) => ({
        lat: p.lat,
        lon: p.lon,
      }))
    }
  }

  return NextResponse.json({
    id: activity.id,
    name: activity.name,
    distance: activity.distance,
    movingTime: activity.moving_time,
    avgSpeed: activity.average_speed * 3.6,
    startDate: activity.start_date,
    points,
    referencePoints,
  })
}
