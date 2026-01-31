import {
  getDistanceFromLatLonInMeters,
  parseGpxAndCalculateDistances,
} from '@/utils/geo'
import { trackRepository } from '../repositories/track.repository'
import { TrackWithPoisDistance } from '../track.types'
import { auth } from '../../auth/auth.config'

export class TrackServiceUser {
  /* Fonction qui get un track avec ses POIs enrichis de distances */
  async get(id: string): Promise<TrackWithPoisDistance | null> {
    const session = await auth()

    const track = await trackRepository.findById(id)
    if (
      track?.visible === false &&
      !(!!session?.user.role && session.user.role === 'ADMIN')
    )
      return null
    if (!track) return null

    const gpxFile = await trackRepository.findGpxContent(id)

    if (!gpxFile || !gpxFile.data) {
      return {
        ...track,
        pois: track.pois.map((p) => ({ ...p, distanceFromStart: 0 })),
      }
    }

    const gpxString = gpxFile.data.toString('utf-8')
    const trackPoints = parseGpxAndCalculateDistances(gpxString)

    const enrichedPois = track.pois.map((poi) => {
      let minDistance = Infinity
      let distanceOnTrack = 0

      for (const pt of trackPoints) {
        const distToPoint = getDistanceFromLatLonInMeters(
          poi.latitude,
          poi.longitude,
          pt.lat,
          pt.lon
        )

        if (distToPoint < minDistance) {
          minDistance = distToPoint
          distanceOnTrack = pt.cumulativeDistance
        }
      }

      return {
        ...poi,
        distanceFromStart: parseFloat((distanceOnTrack / 1000).toFixed(2)),
      }
    })

    enrichedPois.sort((a, b) => a.distanceFromStart - b.distanceFromStart)

    return {
      ...track,
      pois: enrichedPois,
    }
  }
}

export const trackServiceUser = new TrackServiceUser()
