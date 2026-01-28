import {
  getDistanceFromLatLonInMeters,
  parseGpxAndCalculateDistances,
} from '@/utils/geo'
import { trackRepository } from '../repositories/track.repository'
import { TrackWithPoisDistance } from '../track.types'

export class TrackServiceUser {
  async get(id: string): Promise<TrackWithPoisDistance | null> {
    // 1. Récupérer le track avec ses relations (dont les POIs)
    const track = await trackRepository.findById(id)
    if (!track) return null

    // 2. Récupérer le contenu binaire du GPX
    const gpxFile = await trackRepository.findGpxContent(id)

    // Si pas de GPX, on renvoie les POIs avec distance 0 ou null
    if (!gpxFile || !gpxFile.data) {
      return {
        ...track,
        pois: track.pois.map((p) => ({ ...p, distanceFromStart: 0 })),
      }
    }

    // 3. Convertir le Buffer en string et parser les points
    const gpxString = gpxFile.data.toString('utf-8')
    const trackPoints = parseGpxAndCalculateDistances(gpxString)

    // 4. Pour chaque POI, trouver le point du tracé le plus proche ("Snap to track")
    const enrichedPois = track.pois.map((poi) => {
      let minDistance = Infinity
      let distanceOnTrack = 0

      // On parcourt tous les points du tracé pour trouver le plus proche du POI
      // (Algorithme naïf mais suffisant pour < 10k points)
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
        // On convertit en km pour l'affichage (optionnel)
        distanceFromStart: parseFloat((distanceOnTrack / 1000).toFixed(2)),
      }
    })

    // 5. On trie les POIs par ordre de passage (optionnel mais conseillé)
    enrichedPois.sort((a, b) => a.distanceFromStart - b.distanceFromStart)

    return {
      ...track,
      pois: enrichedPois,
    }
  }
}

export const trackServiceUser = new TrackServiceUser()
