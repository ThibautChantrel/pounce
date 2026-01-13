'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gpx'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

/**
 * Fix icônes Leaflet (problème classique avec Webpack / Next.js)
 */
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

/**
 * Couche GPX
 */
function GpxLayer({ url }: { url: string }) {
  const map = useMap()

  useEffect(() => {
    if (!url) return
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gpxLayer = new (L as any).GPX(url, {
      async: true,
      marker_options: {
        startIconUrl:
          'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-start.png',
        endIconUrl:
          'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-icon-end.png',
        shadowUrl:
          'https://raw.githubusercontent.com/mpetazzoni/leaflet-gpx/master/pin-shadow.png',
      },
      polyline_options: {
        color: '#2563eb',
        opacity: 0.85,
        weight: 4,
        lineCap: 'round',
      },
    })

    gpxLayer
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('loaded', (e: any) => {
        map.fitBounds(e.target.getBounds())
      })
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('error', (e: any) => {
        console.error('Erreur chargement GPX:', e)
      })
      .addTo(map)

    // 🔥 nettoyage obligatoire
    return () => {
      map.removeLayer(gpxLayer)
    }
  }, [url, map])

  return null
}

interface GpxViewerProps {
  fileId?: string
  customUrl?: string
}

/**
 * Viewer GPX
 */
export default function GpxViewer({ fileId, customUrl }: GpxViewerProps) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  if (!fileId && !customUrl) return null

  const gpxUrl = customUrl ?? `/api/files/${fileId}`

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border shadow-sm relative">
      <MapContainer
        center={[46.603354, 1.888334]} // centre France
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GpxLayer url={gpxUrl} />
      </MapContainer>
    </div>
  )
}
