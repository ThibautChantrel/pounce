import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getTrackAction } from '@/actions/track/track.action'

import { MapPin } from 'lucide-react'
import { TrackHero } from '@/components/track/TrackHero'
import { TrackDescription } from '@/components/track/TrackDescription'
import { Timeline } from '@/components/Timeline'
import { TrackInlineStats } from '@/components/track/TrackStat'
import { GpxPoint } from '@/components/GpxViewer' // Import du type seulement
import { TrackGpxMap } from '@/components/track/TrackGpxMap'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function TrackDetailPage(props: PageProps) {
  const { id } = await props.params
  const t = await getTranslations('Tracks')

  const track = await getTrackAction(id)

  if (!track) {
    notFound()
  }

  const bannerUrl = track.bannerId
    ? `/api/files/${track.bannerId}`
    : '/images/placeholder-track.jpg'

  const gpxDownloadUrl = `/api/tracks/${track.id}/gpx`

  // URL pour l'affichage de la carte (peut être la même ou api files direct)
  const gpxMapUrl = track.gpxFile ? `/api/files/${track.gpxFile.id}` : undefined

  const createdAt = new Date(track.createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Transformation des POIs BDD en POIs Carte
  // ⚠️ Assurez-vous que vos objets 'poi' ont bien latitude/longitude dans le type de retour de getTrackAction
  const mapPoints: GpxPoint[] = track.pois.map((poi) => ({
    id: poi.id,
    lat: poi.latitude || 0,
    lng: poi.longitude || 0,
    label: poi.name,
    color: '#355F4A',
  }))

  return (
    <main className="min-h-screen dark:bg-black pb-20">
      <TrackHero
        title={track.title}
        bannerUrl={bannerUrl}
        createdAt={createdAt}
        hasGpx={!!track.gpxFile}
      />

      <div className="container max-w-5xl mx-auto py-4">
        <TrackInlineStats
          distance={track.distance}
          elevationGain={track.elevationGain}
          poisCount={track.pois.length}
          gpxUrl={gpxDownloadUrl}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TrackDescription description={track.description!} />

            <TrackGpxMap
              customUrl={gpxMapUrl}
              points={mapPoints}
              className="h-87.5 min-h-0"
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Timeline
              title="Points d’intérêt"
              icon={MapPin}
              items={track.pois.map((poi) => ({
                id: poi.id,
                data: poi,
              }))}
              renderContent={(poi) => (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-clay bg-clay/10 px-1.5 py-0.5 rounded">
                      {poi.distanceFromStart} km
                    </span>
                    <h4 className="font-bold text-sm leading-tight">
                      {poi.name}
                    </h4>
                  </div>

                  {poi.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {poi.description}
                    </p>
                  )}

                  <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider opacity-60">
                    {poi.type}
                  </div>
                </>
              )}
              renderEnd={
                <>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {track.distance} km
                  </span>
                  <h4 className="font-bold text-sm leading-tight mt-1">
                    {t('Arrival')}
                  </h4>
                </>
              }
            />
          </div>
        </div>
      </div>
    </main>
  )
}
