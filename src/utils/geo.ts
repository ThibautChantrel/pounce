export function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

type GpxPoint = { lat: number; lon: number; cumulativeDistance: number }

export function parseGpxAndCalculateDistances(gpxString: string): GpxPoint[] {
  const points: GpxPoint[] = []
  const regex = /<trkpt\s+lat="([\d.-]+)"\s+lon="([\d.-]+)"/g
  let match

  let totalDistance = 0
  let prevLat: number | null = null
  let prevLon: number | null = null

  while ((match = regex.exec(gpxString)) !== null) {
    const lat = parseFloat(match[1])
    const lon = parseFloat(match[2])

    if (prevLat !== null && prevLon !== null) {
      const dist = getDistanceFromLatLonInMeters(prevLat, prevLon, lat, lon)
      totalDistance += dist
    }

    points.push({ lat, lon, cumulativeDistance: totalDistance })
    prevLat = lat
    prevLon = lon
  }

  return points
}
