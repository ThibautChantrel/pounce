import {
  parseGpxAndCalculateDistances,
  getDistanceFromLatLonInMeters,
} from '@/utils/geo'

const CONTROL_POINT_COUNT = 16
const MATCH_RADIUS_METERS = 150
const MIN_MATCHED_POINTS = 12

type LatLon = { lat: number; lon: number }

/**
 * Decodes a Google/Strava encoded polyline into an array of [lat, lon] pairs.
 */
export function decodePolyline(encoded: string): LatLon[] {
  const points: LatLon[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let b: number

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    lat += result & 1 ? ~(result >> 1) : result >> 1

    result = 0
    shift = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    lng += result & 1 ? ~(result >> 1) : result >> 1

    points.push({ lat: lat / 1e5, lon: lng / 1e5 })
  }

  return points
}

/**
 * Extracts CONTROL_POINT_COUNT evenly-spaced points from the GPX track.
 */
function extractControlPoints(gpxString: string): LatLon[] {
  const trackPoints = parseGpxAndCalculateDistances(gpxString)
  if (trackPoints.length < 2) return []

  const totalDistance = trackPoints[trackPoints.length - 1].cumulativeDistance
  const controlPoints: LatLon[] = []

  for (let i = 0; i < CONTROL_POINT_COUNT; i++) {
    const targetDistance = (i / (CONTROL_POINT_COUNT - 1)) * totalDistance
    let closest = trackPoints[0]
    let minDiff = Math.abs(trackPoints[0].cumulativeDistance - targetDistance)

    for (const pt of trackPoints) {
      const diff = Math.abs(pt.cumulativeDistance - targetDistance)
      if (diff < minDiff) {
        minDiff = diff
        closest = pt
      }
    }
    controlPoints.push({ lat: closest.lat, lon: closest.lon })
  }

  return controlPoints
}

/**
 * For each control point, finds the index of the nearest Strava point within MATCH_RADIUS_METERS.
 * Returns null for control points that have no match.
 */
function findMatchIndices(
  controlPoints: LatLon[],
  stravaPoints: LatLon[]
): (number | null)[] {
  return controlPoints.map((cp) => {
    let bestIndex: number | null = null
    let bestDist = Infinity

    for (let i = 0; i < stravaPoints.length; i++) {
      const d = getDistanceFromLatLonInMeters(
        cp.lat,
        cp.lon,
        stravaPoints[i].lat,
        stravaPoints[i].lon
      )
      if (d < bestDist && d <= MATCH_RADIUS_METERS) {
        bestDist = d
        bestIndex = i
      }
    }

    return bestIndex
  })
}

/**
 * Checks if matched indices form a monotonically increasing or decreasing sequence.
 * Ignores null entries. Requires at least MIN_MATCHED_POINTS non-null matches.
 */
function isOrderValid(indices: (number | null)[]): boolean {
  const found = indices.filter((i): i is number => i !== null)
  if (found.length < MIN_MATCHED_POINTS) return false

  let forwardOk = true
  let backwardOk = true

  for (let i = 1; i < found.length; i++) {
    if (found[i] <= found[i - 1]) forwardOk = false
    if (found[i] >= found[i - 1]) backwardOk = false
  }

  return forwardOk || backwardOk
}

export type MatchResult = {
  matched: boolean
  matchedPoints: number
  totalPoints: number
  direction: 'forward' | 'backward' | 'none'
}

/**
 * Main matching function. Returns whether the Strava activity covers the reference GPX track.
 */
export function matchActivityToTrack(
  encodedPolyline: string,
  gpxString: string
): MatchResult {
  const stravaPoints = decodePolyline(encodedPolyline)
  if (stravaPoints.length === 0) {
    return {
      matched: false,
      matchedPoints: 0,
      totalPoints: CONTROL_POINT_COUNT,
      direction: 'none',
    }
  }

  const controlPoints = extractControlPoints(gpxString)
  if (controlPoints.length === 0) {
    return {
      matched: false,
      matchedPoints: 0,
      totalPoints: CONTROL_POINT_COUNT,
      direction: 'none',
    }
  }

  const indices = findMatchIndices(controlPoints, stravaPoints)
  const found = indices.filter((i): i is number => i !== null)

  if (found.length < MIN_MATCHED_POINTS) {
    return {
      matched: false,
      matchedPoints: found.length,
      totalPoints: CONTROL_POINT_COUNT,
      direction: 'none',
    }
  }

  let forwardOk = true

  for (let i = 1; i < found.length; i++) {
    if (found[i] <= found[i - 1]) forwardOk = false
  }

  if (!isOrderValid(indices)) {
    return {
      matched: false,
      matchedPoints: found.length,
      totalPoints: CONTROL_POINT_COUNT,
      direction: 'none',
    }
  }

  return {
    matched: true,
    matchedPoints: found.length,
    totalPoints: CONTROL_POINT_COUNT,
    direction: forwardOk ? 'forward' : 'backward',
  }
}
