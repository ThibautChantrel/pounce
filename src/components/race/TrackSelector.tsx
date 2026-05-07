'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Plus, Search, CheckCircle2, FileUp, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { searchTracksAction } from '@/actions/race/race.actions'

export type TrackSelectorValue =
  | {
      mode: 'existing'
      trackId: string
      trackMeta: { title: string; distance: number; elevationGain: number }
    }
  | {
      mode: 'new'
      title: string
      distance: string
      elevationGain: string
      gpxFile: File | null
    }

type ExistingTrack = {
  id: string
  title: string
  distance: number
  elevationGain: number
  gpxFileId: string | null
}

type ReadOnlyTrack = {
  id: string
  title: string
  distance: number
  elevationGain: number
  gpxFileId?: string | null
}

type Props = {
  value: TrackSelectorValue | null
  onChange: (v: TrackSelectorValue) => void
  readOnly?: ReadOnlyTrack
}

export function TrackSelector({ value, onChange, readOnly }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExistingTrack[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gpxInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchTracksAction(query)
        setResults(res)
        setOpen(true)
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [query])

  const mode = value?.mode ?? 'new'

  function switchMode(m: 'existing' | 'new') {
    if (m === 'new') {
      onChange({
        mode: 'new',
        title: '',
        distance: '',
        elevationGain: '',
        gpxFile: null,
      })
    } else {
      // Reset to existing mode without selection
      onChange({
        mode: 'existing',
        trackId: '',
        trackMeta: { title: '', distance: 0, elevationGain: 0 },
      })
    }
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function selectTrack(track: ExistingTrack) {
    onChange({
      mode: 'existing',
      trackId: track.id,
      trackMeta: {
        title: track.title,
        distance: track.distance,
        elevationGain: track.elevationGain,
      },
    })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function clearSelection() {
    onChange({
      mode: 'existing',
      trackId: '',
      trackMeta: { title: '', distance: 0, elevationGain: 0 },
    })
    setQuery('')
  }

  // Read-only display (edit mode — track is linked to an existing race)
  if (readOnly) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-0.5">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {readOnly.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {readOnly.distance.toFixed(1)} km · {readOnly.elevationGain} m D+
            {readOnly.gpxFileId && (
              <span className="ml-2 text-primary">· Trace GPX</span>
            )}
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            Le parcours ne peut pas être modifié après création.
          </p>
        </div>
      </div>
    )
  }

  const isExisting = mode === 'existing'
  const isNew = mode === 'new'
  const hasSelection = isExisting && value?.mode === 'existing' && value.trackId

  const newVal = value?.mode === 'new' ? value : null

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => switchMode('existing')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors',
            isExisting
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Search className="w-3.5 h-3.5" />
          Parcours existant
        </button>
        <button
          type="button"
          onClick={() => switchMode('new')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors border-l border-border',
            isNew
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Nouveau parcours
        </button>
      </div>

      {/* Existing track — search + selection */}
      {isExisting && (
        <div ref={containerRef} className="space-y-3">
          {hasSelection ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {
                    (value as Extract<TrackSelectorValue, { mode: 'existing' }>)
                      .trackMeta.title
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {(
                    value as Extract<TrackSelectorValue, { mode: 'existing' }>
                  ).trackMeta.distance.toFixed(1)}{' '}
                  km ·{' '}
                  {
                    (value as Extract<TrackSelectorValue, { mode: 'existing' }>)
                      .trackMeta.elevationGain
                  }{' '}
                  m D+
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un parcours par nom…"
                className="pl-9"
              />
              {open && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                  {searching && (
                    <p className="text-xs text-muted-foreground px-4 py-3">
                      Recherche…
                    </p>
                  )}
                  {!searching && results.length === 0 && (
                    <p className="text-xs text-muted-foreground px-4 py-3">
                      Aucun parcours trouvé
                    </p>
                  )}
                  {!searching &&
                    results.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => selectTrack(track)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {track.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {track.distance.toFixed(1)} km ·{' '}
                            {track.elevationGain} m D+
                            {track.gpxFileId && ' · GPX'}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* New track — manual fields + GPX */}
      {isNew && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="trackTitle">Nom du parcours *</Label>
            <Input
              id="trackTitle"
              value={newVal?.title ?? ''}
              onChange={(e) =>
                onChange({
                  ...(newVal ?? {
                    mode: 'new',
                    distance: '',
                    elevationGain: '',
                    gpxFile: null,
                  }),
                  mode: 'new',
                  title: e.target.value,
                })
              }
              placeholder="Ex: Boucle des Crêtes"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trackDistance">Distance (km) *</Label>
              <Input
                id="trackDistance"
                type="number"
                min={0.1}
                step={0.1}
                value={newVal?.distance ?? ''}
                onChange={(e) =>
                  onChange({
                    ...(newVal ?? {
                      mode: 'new',
                      title: '',
                      elevationGain: '',
                      gpxFile: null,
                    }),
                    mode: 'new',
                    distance: e.target.value,
                  })
                }
                placeholder="42.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trackElevation">Dénivelé (m D+) *</Label>
              <Input
                id="trackElevation"
                type="number"
                min={0}
                value={newVal?.elevationGain ?? ''}
                onChange={(e) =>
                  onChange({
                    ...(newVal ?? {
                      mode: 'new',
                      title: '',
                      distance: '',
                      gpxFile: null,
                    }),
                    mode: 'new',
                    elevationGain: e.target.value,
                  })
                }
                placeholder="1200"
              />
            </div>
          </div>

          {/* GPX upload */}
          <div className="space-y-1.5">
            <Label>
              Trace GPX{' '}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </Label>
            <input
              ref={gpxInputRef}
              type="file"
              accept=".gpx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                onChange({
                  ...(newVal ?? {
                    mode: 'new',
                    title: '',
                    distance: '',
                    elevationGain: '',
                  }),
                  mode: 'new',
                  gpxFile: f,
                })
              }}
            />
            {newVal?.gpxFile ? (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5">
                <FileUp className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate flex-1">
                  {newVal.gpxFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...newVal, gpxFile: null })
                    if (gpxInputRef.current) gpxInputRef.current.value = ''
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => gpxInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-sm"
              >
                <FileUp className="w-4 h-4" />
                Sélectionner un fichier .gpx
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
