'use client'

import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gpx'
import { MapContainer, TileLayer, useMap, Marker, Tooltip } from 'react-leaflet'
import { renderToString } from 'react-dom/server'
import { PawPrint } from 'lucide-react'

export type GpxPoint = {
  id?: string | number
  lat: number
  lng: number
  label: string
  color?: string
}

const PawMarker = ({ point }: { point: GpxPoint }) => {
  const icon = useMemo(() => {
    const color = point.color || '#F5EEE0'

    const iconHtml = renderToString(
      <div className="relative flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-white transform hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
        >
          <PawPrint size={20} fill="currentColor" fillOpacity={0.2} />
        </div>
        {/* Pointe */}
        <div
          className="absolute -bottom-1 w-3 h-3 rotate-45"
          style={{ backgroundColor: color }}
        />
      </div>
    )

    return L.divIcon({
      html: iconHtml,
      className: 'bg-transparent',
      iconSize: [40, 40],
      iconAnchor: [20, 44],
      popupAnchor: [0, -44],
    })
  }, [point.color])

  return (
    <Marker position={[point.lat, point.lng]} icon={icon}>
      <Tooltip
        direction="top"
        offset={[0, -45]}
        opacity={1}
        className="text-sm"
      >
        {point.label}
      </Tooltip>
    </Marker>
  )
}

function fixLeafletIcons() {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

function GpxLayer({ url }: { url: string }) {
  const map = useMap()
  useEffect(() => {
    if (!url) return
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gpxLayer = new (L as any).GPX(url, {
      async: true,
      marker_options: {
        startIconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.7.0/pin-icon-start.png',
        endIconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.7.0/pin-icon-end.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.7.0/pin-shadow.png',
      },
      polyline_options: {
        color: '#355F4A',
        opacity: 0.8,
        weight: 5,
        lineCap: 'round',
      },
    })
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    gpxLayer
      .on('loaded', (e: any) => map.fitBounds(e.target.getBounds()))
      .addTo(map)
    return () => {
      map.removeLayer(gpxLayer)
    }
  }, [url, map])
  return null
}

interface GpxViewerProps {
  fileId?: string
  customUrl?: string
  points?: GpxPoint[]
}

export default function GpxViewer({
  fileId,
  customUrl,
  points = [],
}: GpxViewerProps) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  if (!fileId && !customUrl) return null
  const gpxUrl = customUrl ?? `/api/files/${fileId}`

  return (
    <div className="w-full h-full min-h-100 rounded-lg overflow-hidden border shadow-sm relative z-0">
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GpxLayer url={gpxUrl} />

        {/* BOUCLE SUR LA LISTE DES POINTS */}
        {points.map((point, index) => (
          <PawMarker key={point.id || index} point={point} />
        ))}
      </MapContainer>
    </div>
  )
}
