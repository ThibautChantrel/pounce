'use client'

import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gpx'
import { MapContainer, TileLayer, useMap, Marker, Tooltip } from 'react-leaflet'
import { renderToString } from 'react-dom/server'
import { PawPrint, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const CustomZoomControl = () => {
  const map = useMap()

  return (
    <div className="absolute bottom-5 right-5 z-400 flex flex-col gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          map.zoomIn()
        }}
        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate hover:bg-zinc-50 hover:text-black transition-all border border-zinc-100"
        aria-label="Zoom in"
      >
        <Plus size={20} className="cursor-pointer" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          map.zoomOut()
        }}
        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate hover:bg-zinc-50 hover:text-black transition-all border border-zinc-100"
        aria-label="Zoom out"
      >
        <Minus size={20} className="cursor-pointer" />
      </button>
    </div>
  )
}

function GpxLayer({
  url,
  onStartEndPoints,
}: {
  url: string
  onStartEndPoints?: (points: { start: GpxPoint; end: GpxPoint }) => void
}) {
  const map = useMap()
  useEffect(() => {
    if (!url) return

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gpxLayer = new (L as any).GPX(url, {
      async: true,
      parseElements: [],
    })

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    gpxLayer.on('loaded', async (e: any) => {
      const layer = e.target

      const response = await fetch(url)
      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')

      const trackPoints: [number, number][] = []
      const trkpts = xmlDoc.getElementsByTagName('trkpt')

      for (let i = 0; i < trkpts.length; i++) {
        const trkpt = trkpts[i]
        const lat = parseFloat(trkpt.getAttribute('lat') || '0')
        const lon = parseFloat(trkpt.getAttribute('lon') || '0')
        trackPoints.push([lat, lon])
      }

      if (trackPoints.length > 0) {
        const polyline = L.polyline(trackPoints, {
          color: '#355F4A',
          opacity: 1,
          weight: 5,
          lineCap: 'round',
        }).addTo(map)

        const startPoint = trackPoints[0]
        const endPoint = trackPoints[trackPoints.length - 1]

        if (onStartEndPoints && startPoint && endPoint) {
          onStartEndPoints({
            start: {
              lat: startPoint[0],
              lng: startPoint[1],
              label: 'Départ',
              color: '#F5EEE0',
            },
            end: {
              lat: endPoint[0],
              lng: endPoint[1],
              label: 'Arrivée',
              color: '#EF4444',
            },
          })
        }

        map.fitBounds(polyline.getBounds())
      }
      map.removeLayer(layer)
    })

    gpxLayer.addTo(map)

    return () => {
      // Cleanup
    }
  }, [url, map, onStartEndPoints])
  return null
}

export interface GpxViewerProps {
  fileId?: string
  customUrl?: string
  points?: GpxPoint[]
  className?: string
}

export default function GpxViewer({
  fileId,
  customUrl,
  points = [],
  className,
}: GpxViewerProps) {
  const [startEndPoints, setStartEndPoints] = useState<{
    start: GpxPoint | null
    end: GpxPoint | null
  }>({ start: null, end: null })

  useEffect(() => {
    fixLeafletIcons()
  }, [])

  if (!fileId && !customUrl) return null
  const gpxUrl = customUrl ?? `/api/files/${fileId}`

  const allPoints = [
    ...(startEndPoints.start ? [startEndPoints.start] : []),
    ...(startEndPoints.end ? [startEndPoints.end] : []),
    ...points,
  ]

  return (
    <div
      className={cn(
        'w-full h-full min-h-100 rounded-lg overflow-hidden border shadow-sm relative z-0',
        className
      )}
    >
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={5}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CustomZoomControl />

        <GpxLayer
          url={gpxUrl}
          onStartEndPoints={(points) => {
            setStartEndPoints({
              start: points.start,
              end: points.end,
            })
          }}
        />

        {allPoints.map((point, index) => (
          <PawMarker
            key={point.id || `${point.label}-${index}`}
            point={point}
          />
        ))}
      </MapContainer>
    </div>
  )
}
