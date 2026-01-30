import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getTrackAction } from '@/actions/track/track.action'

import { MapPin } from 'lucide-react'
import { TrackHero } from '@/components/track/TrackHero'
import { TrackDescription } from '@/components/track/TrackDescription'
import { TrackMapPlaceholder } from '@/components/track/TrackMapPlaceHolder'
import { Timeline } from '@/components/Timeline'
import { TrackInlineStats } from '@/components/track/TrackStat'

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

  const gpxDownloadUrl = `/api/files/${track.gpxFile?.id}`

  const createdAt = new Date(track.createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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

            <TrackMapPlaceholder />
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
