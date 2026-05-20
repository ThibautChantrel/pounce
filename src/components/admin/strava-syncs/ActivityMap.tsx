'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

type LatLon = { lat: number; lon: number }

function PolylineLayer({
  activityPoints,
  referencePoints,
}: {
  activityPoints: LatLon[]
  referencePoints: LatLon[]
}) {
  const map = useMap()

  useEffect(() => {
    const layers: L.Polyline[] = []

    if (referencePoints.length > 0) {
      const ref = L.polyline(
        referencePoints.map((p) => [p.lat, p.lon] as [number, number]),
        { color: '#3b82f6', weight: 3, opacity: 0.8 }
      ).addTo(map)
      layers.push(ref)
    }

    if (activityPoints.length > 0) {
      const act = L.polyline(
        activityPoints.map((p) => [p.lat, p.lon] as [number, number]),
        { color: '#f97316', weight: 4, opacity: 0.9 }
      ).addTo(map)
      layers.push(act)
      map.fitBounds(act.getBounds(), { padding: [24, 24] })
    }

    return () => {
      layers.forEach((l) => map.removeLayer(l))
    }
  }, [map, activityPoints, referencePoints])

  return null
}

export default function ActivityMap({
  activityPoints,
  referencePoints,
}: {
  activityPoints: LatLon[]
  referencePoints: LatLon[]
}) {
  return (
    <MapContainer
      center={[46.603354, 1.888334]}
      zoom={5}
      scrollWheelZoom={true}
      zoomControl={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PolylineLayer
        activityPoints={activityPoints}
        referencePoints={referencePoints}
      />
    </MapContainer>
  )
}
