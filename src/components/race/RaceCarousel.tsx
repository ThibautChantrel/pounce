'use client'

import { useState, useEffect } from 'react'
import {
  Flag,
  Search,
  X,
  Footprints,
  Bike,
  TrendingUp,
  RefreshCw,
  Zap,
  Play,
  CheckCircle,
} from 'lucide-react'
import { ActivityMode, RaceFormat, RaceStatus } from '@prisma/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  MultiSelect,
  type MultiSelectOption,
} from '@/components/ui/multi-select'
import { cn } from '@/lib/utils'
import { RaceCard } from './RaceCard'
import { listPublicRacesAction } from '@/actions/race/race.actions'
import type { RaceSummary } from '@/actions/race/race.types'
import { Link } from '@/navigation'

const FORMAT_OPTIONS: MultiSelectOption<RaceFormat>[] = [
  {
    value: RaceFormat.ONE_SHOT,
    label: 'Course',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    value: RaceFormat.BACKYARD,
    label: 'Backyard',
    icon: <RefreshCw className="w-3.5 h-3.5" />,
  },
]

const STATUS_OPTIONS: MultiSelectOption<RaceStatus>[] = [
  {
    value: RaceStatus.ACTIVE,
    label: 'Ouvertes',
    icon: <Flag className="w-3.5 h-3.5" />,
  },
  {
    value: RaceStatus.IN_PROGRESS,
    label: 'En cours',
    icon: <Play className="w-3.5 h-3.5" />,
  },
  {
    value: RaceStatus.CLOSED,
    label: 'Terminées',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
]

const MODE_FILTERS: {
  value: ActivityMode | 'all'
  label: string
  icon: React.ReactNode
}[] = [
  { value: 'all', label: 'Tous', icon: null },
  {
    value: ActivityMode.RUN,
    label: 'Course à pied',
    icon: <Footprints className="w-3 h-3" />,
  },
  {
    value: ActivityMode.RIDE,
    label: 'Vélo',
    icon: <Bike className="w-3 h-3" />,
  },
  {
    value: ActivityMode.HYBRID,
    label: 'Mixte',
    icon: <TrendingUp className="w-3 h-3" />,
  },
]

export function RaceCarousel() {
  const [races, setRaces] = useState<RaceSummary[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [formats, setFormats] = useState<RaceFormat[]>([])
  const [mode, setMode] = useState<ActivityMode | 'all'>('all')
  const [statuses, setStatuses] = useState<RaceStatus[]>([
    RaceStatus.ACTIVE,
    RaceStatus.IN_PROGRESS,
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    async function fetchRaces() {
      setLoading(true)
      const { data, total } = await listPublicRacesAction({
        take: 12,
        search: debouncedSearch || undefined,
        formats: formats.length > 0 ? formats : undefined,
        activityMode: mode === 'all' ? undefined : mode,
        statuses: statuses.length > 0 ? statuses : undefined,
      })
      setRaces(data)
      setTotal(total)
      setLoading(false)
    }
    fetchRaces()
  }, [debouncedSearch, formats, mode, statuses])

  return (
    <div className="w-full py-4 flex flex-col gap-6">
      <div className="container px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-full">
              <Flag className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Courses
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Rechercher une course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 bg-background/50 backdrop-blur-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <MultiSelect
              options={FORMAT_OPTIONS}
              selected={formats}
              onChange={setFormats}
              label="Format"
            />

            <div className="flex flex-wrap gap-1.5">
              {MODE_FILTERS.map((f) => (
                <Button
                  key={String(f.value)}
                  variant="ghost"
                  onClick={() => setMode(f.value)}
                  className={cn(
                    'h-auto rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                    mode === f.value
                      ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                      : 'bg-background/50 text-muted-foreground border-border hover:bg-background/50 hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {f.icon}
                  {f.label}
                </Button>
              ))}
            </div>

            <MultiSelect
              options={STATUS_OPTIONS}
              selected={statuses}
              onChange={setStatuses}
              label="Statut"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card h-64 animate-pulse"
              />
            ))}
          </div>
        ) : races.length === 0 ? (
          <div className="text-center py-16">
            <Flag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm">
              Aucune course disponible pour le moment
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/races/create">Organiser une course</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {races.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
            {total > races.length && (
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  {total - races.length} course
                  {total - races.length > 1 ? 's' : ''} de plus
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
