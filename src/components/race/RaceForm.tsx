'use client'

import { useState } from 'react'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import { ActivityMode, RaceAccessType, RaceFormat } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchTracks } from '@/actions/track/track.admin.action'
import { fetchFiles } from '@/actions/file/file.admin.actions'
import { createRaceAction, updateRaceAction } from '@/actions/race/race.actions'
import type { CreateRaceInput, RaceSummary } from '@/actions/race/race.types'
import { RefreshCw, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type TrackOption = { id: string; title: string; distance: number }
type FileOption = { id: string; filename: string }

type Props = {
  defaultValues?: Partial<RaceSummary & { id: string }>
}

const ACTIVITY_OPTIONS: { value: ActivityMode; label: string }[] = [
  { value: ActivityMode.RUN, label: 'Course à pied' },
  { value: ActivityMode.RIDE, label: 'Vélo' },
  { value: ActivityMode.HYBRID, label: 'Mixte' },
]

const ACCESS_OPTIONS: { value: RaceAccessType; label: string; desc: string }[] =
  [
    {
      value: RaceAccessType.PUBLIC_FREE,
      label: 'Publique libre',
      desc: 'Inscription ouverte à tous',
    },
    {
      value: RaceAccessType.PUBLIC_VALIDATION,
      label: 'Sur validation',
      desc: "L'organisateur valide chaque inscription",
    },
    {
      value: RaceAccessType.PRIVATE,
      label: 'Privée',
      desc: 'Accès par code uniquement',
    },
  ]

function toDatetimeLocal(d?: Date | null) {
  if (!d) return ''
  const dt = new Date(d)
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString().slice(0, 16)
}

export function RaceForm({ defaultValues }: Props) {
  const router = useRouter()
  const isEdit = !!defaultValues?.id

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(
    defaultValues?.description ?? ''
  )
  const [activityMode, setActivityMode] = useState<ActivityMode>(
    defaultValues?.activityMode ?? ActivityMode.RUN
  )
  const [format, setFormat] = useState<RaceFormat>(
    defaultValues?.format ?? RaceFormat.ONE_SHOT
  )
  const [accessType, setAccessType] = useState<RaceAccessType>(
    defaultValues?.accessType ?? RaceAccessType.PUBLIC_FREE
  )
  const [accessCode, setAccessCode] = useState(
    (defaultValues as { accessCode?: string | null } | undefined)?.accessCode ??
      ''
  )
  const [maxParticipants, setMaxParticipants] = useState(
    defaultValues?.maxParticipants?.toString() ?? ''
  )
  const [startAt, setStartAt] = useState(
    toDatetimeLocal(defaultValues?.startAt)
  )
  const [endAt, setEndAt] = useState(toDatetimeLocal(defaultValues?.endAt))
  const [loopDurationMinutes, setLoopDurationMinutes] = useState(
    defaultValues?.loopDurationMinutes?.toString() ?? ''
  )

  const [trackId, setTrackId] = useState(defaultValues?.track?.id ?? '')
  const [logoId, setLogoId] = useState(defaultValues?.logoId ?? '')
  const [bannerId, setBannerId] = useState(defaultValues?.bannerId ?? '')

  const [tracks, setTracks] = useState<TrackOption[]>([])
  const [files, setFiles] = useState<FileOption[]>([])
  const [tracksLoaded, setTracksLoaded] = useState(false)
  const [filesLoaded, setFilesLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  async function loadTracks() {
    if (tracksLoaded) return
    const res = await fetchTracks({ skip: 0, take: 100 })
    setTracks(
      res.data.map((t) => ({ id: t.id, title: t.title, distance: t.distance }))
    )
    setTracksLoaded(true)
  }

  async function loadFiles() {
    if (filesLoaded) return
    const res = await fetchFiles({ skip: 0, take: 200 })
    setFiles(res.data.map((f) => ({ id: f.id, filename: f.filename })))
    setFilesLoaded(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startAt || !endAt || !trackId) {
      toast.error('Remplis les champs obligatoires')
      return
    }

    const data: CreateRaceInput = {
      title: title.trim(),
      description: description.trim() || null,
      activityMode,
      format,
      accessType,
      accessCode:
        accessType === RaceAccessType.PRIVATE
          ? accessCode.trim() || null
          : null,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      loopDurationMinutes:
        format === RaceFormat.BACKYARD && loopDurationMinutes
          ? parseInt(loopDurationMinutes)
          : null,
      trackId,
      logoId: logoId || null,
      bannerId: bannerId || null,
    }

    setLoading(true)
    try {
      const result = isEdit
        ? await updateRaceAction({ ...data, id: defaultValues!.id! })
        : await createRaceAction(data)

      if (!result.success) {
        toast.error("Erreur lors de l'enregistrement")
        return
      }

      toast.success(
        isEdit ? 'Course mise à jour' : 'Course soumise pour validation'
      )
      router.push(isEdit ? `/races/${defaultValues!.id}` : '/profile/races')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Format selector */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            value: RaceFormat.ONE_SHOT,
            label: 'Course classique',
            icon: <Zap className="w-4 h-4" />,
            desc: 'Un parcours à réaliser une fois',
          },
          {
            value: RaceFormat.BACKYARD,
            label: 'Backyard',
            icon: <RefreshCw className="w-4 h-4" />,
            desc: 'Boucles répétées toutes les X heures',
          },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFormat(f.value)}
            className={cn(
              'flex flex-col gap-1 p-4 rounded-xl border text-left transition-all',
              format === f.value
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              {f.icon} {f.label}
            </span>
            <span className="text-xs">{f.desc}</span>
          </button>
        ))}
      </div>

      {/* Infos générales */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Grand Trail des Crêtes 2026"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris ta course..."
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Mode d&apos;activité *</Label>
          <div className="flex gap-2 flex-wrap">
            {ACTIVITY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setActivityMode(o.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                  activityMode === o.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parcours */}
      <div className="space-y-1.5">
        <Label>Parcours *</Label>
        <Select
          value={trackId}
          onValueChange={setTrackId}
          onOpenChange={(open) => {
            if (open) loadTracks()
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un parcours" />
          </SelectTrigger>
          <SelectContent>
            {tracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title} — {t.distance.toFixed(1)} km
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startAt">Début *</Label>
          <Input
            id="startAt"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endAt">Fin *</Label>
          <Input
            id="endAt"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            required
          />
        </div>
      </div>

      {format === RaceFormat.BACKYARD && (
        <div className="space-y-1.5">
          <Label htmlFor="loopDuration">
            Durée d&apos;une boucle (minutes) *
          </Label>
          <Input
            id="loopDuration"
            type="number"
            min={1}
            value={loopDurationMinutes}
            onChange={(e) => setLoopDurationMinutes(e.target.value)}
            placeholder="Ex: 240 (= 4 heures)"
          />
        </div>
      )}

      {/* Accès */}
      <div className="space-y-3">
        <Label>Mode d&apos;accès *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ACCESS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setAccessType(o.value)}
              className={cn(
                'flex flex-col gap-0.5 p-3 rounded-xl border text-left transition-all',
                accessType === o.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              <span className="text-sm font-semibold text-foreground">
                {o.label}
              </span>
              <span className="text-xs text-muted-foreground">{o.desc}</span>
            </button>
          ))}
        </div>
        {accessType === RaceAccessType.PRIVATE && (
          <div className="space-y-1.5">
            <Label htmlFor="accessCode">Code d&apos;accès</Label>
            <Input
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Ex: TRAIL2026"
            />
          </div>
        )}
      </div>

      {/* Jauge */}
      <div className="space-y-1.5">
        <Label htmlFor="maxParticipants">
          Nombre max de participants (vide = illimité)
        </Label>
        <Input
          id="maxParticipants"
          type="number"
          min={1}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          placeholder="Illimité"
          className="max-w-xs"
        />
      </div>

      {/* Médias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Logo</Label>
          <Select
            value={logoId}
            onValueChange={setLogoId}
            onOpenChange={(open) => {
              if (open) loadFiles()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un fichier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucun</SelectItem>
              {files.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Bannière</Label>
          <Select
            value={bannerId}
            onValueChange={setBannerId}
            onOpenChange={(open) => {
              if (open) loadFiles()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un fichier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucune</SelectItem>
              {files.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Enregistrement...'
            : isEdit
              ? 'Mettre à jour'
              : 'Soumettre la course'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
