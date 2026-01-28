import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import {
  MapPin,
  Mountain,
  Navigation,
  Download,
  Calendar,
  Clock,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getTrackAction } from '@/actions/track/track.action'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function TrackDetailPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Tracks.Detail') // Assure-toi d'avoir ces clés ou utilise des strings par défaut

  // Récupération de la donnée enrichie (avec POIs et distances)
  const track = await getTrackAction(params.id)

  if (!track) {
    notFound()
  }

  // URLs des images
  const coverUrl = track.cover
    ? `/api/files/${track.cover.id}`
    : '/images/placeholder-track.jpg' // Ton placeholder par défaut

  const gpxDownloadUrl = `/api/tracks/${track.id}/gpx`

  // Formatage de la date
  const dateStr = new Date(track.createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black pb-20">
      {/* --- 1. HERO HEADER (Image + Titre) --- */}
      <div className="relative h-[40vh] min-h-[300px] w-full group overflow-hidden">
        <Image
          src={coverUrl}
          alt={track.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 container max-w-5xl mx-auto px-4 flex flex-col justify-end pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none"
            >
              Parcours
            </Badge>
            {track.gpxFile && (
              <Badge variant="outline" className="text-white border-white/40">
                GPX Disponible
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white font-heading uppercase tracking-wide mb-2">
            {track.title}
          </h1>

          <div className="flex items-center text-white/80 font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            Créé le {dateStr}
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- 2. COLONNE GAUCHE (Infos principales) --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Carte de Stats */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> Distance
                    </span>
                    <span className="text-2xl font-bold font-mono text-canopy">
                      {track.distance}{' '}
                      <span className="text-sm text-foreground font-normal">
                        km
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <Mountain className="w-3 h-3" /> Dénivelé +
                    </span>
                    <span className="text-2xl font-bold font-mono text-canopy">
                      {track.elevationGain || 0}{' '}
                      <span className="text-sm text-foreground font-normal">
                        m
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Points
                    </span>
                    <span className="text-2xl font-bold font-mono text-canopy">
                      {track.pois.length}
                    </span>
                  </div>

                  {/* Estimation temps (Ex: 10km/h en moyenne pour un métro run ?) */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. Temps
                    </span>
                    <span className="text-2xl font-bold font-mono text-canopy">
                      {/* Calcul simple : 10km/h */}
                      {Math.round(track.distance / 10)}h
                      {Math.round((track.distance % 10) * 6)
                        .toString()
                        .padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="flex items-center gap-2 text-xl font-bold text-canopy">
                <Info className="w-5 h-5" /> À propos
              </h3>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {track.description || 'Aucune description pour ce parcours.'}
              </p>
            </div>

            {/* Zone Carte (Placeholder pour l'instant) */}
            {/* Tu pourras y mettre ton composant Leaflet ici plus tard */}
            <div className="h-96 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Carte interactive bientôt disponible</p>
              </div>
            </div>
          </div>

          {/* --- 3. COLONNE DROITE (Actions & Timeline POIs) --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bouton Téléchargement */}
            <Card className="overflow-hidden">
              <div className="p-1 bg-canopy/10">
                <Button
                  className="w-full bg-canopy hover:bg-canopy/90 text-white"
                  asChild
                  size="lg"
                >
                  <a href={gpxDownloadUrl} download>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le GPX
                  </a>
                </Button>
              </div>
            </Card>

            {/* TIMELINE DES POIs */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-clay" />
                Points d intérêt
              </h3>

              <div className="relative pl-2 space-y-8">
                {/* Ligne verticale */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

                {track.pois.map((poi, index) => (
                  <div key={poi.id} className="relative flex gap-4 group">
                    {/* Point sur la ligne */}
                    <div className="relative z-10 shrink-0 mt-1">
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-black border-2 border-canopy flex items-center justify-center text-[10px] font-bold text-canopy shadow-sm group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="pb-2">
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
                    </div>
                  </div>
                ))}

                {/* Point final (Arrivée) */}
                <div className="relative flex gap-4">
                  <div className="relative z-10 shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-white border-2 border-zinc-900 dark:border-white flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {track.distance} km
                    </span>
                    <h4 className="font-bold text-sm leading-tight mt-1">
                      Arrivée
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
