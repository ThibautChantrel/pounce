'use client'

import { useRef, useState } from 'react'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import { ActivityMode, RaceAccessType, RaceFormat } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadFileAction } from '@/actions/file/file.admin.actions'
import {
  createRaceAction,
  updateRaceAction,
  createRaceTrackAction,
} from '@/actions/race/race.actions'
import type { CreateRaceInput, RaceSummary } from '@/actions/race/race.types'
import { RefreshCw, Zap, ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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

function ImageField({
  label,
  existingUrl,
  file,
  onFile,
  onClear,
  accept = 'image/*',
}: {
  label: string
  existingUrl?: string | null
  file: File | null
  onFile: (f: File) => void
  onClear: () => void
  accept?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : existingUrl

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border h-28 bg-muted">
          <Image src={preview} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={() => {
              onClear()
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 rounded-full p-0.5 text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-28 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-xs">Cliquer pour sélectionner</span>
        </button>
      )}
    </div>
  )
}

export function RaceForm({ defaultValues }: Props) {
  const router = useRouter()
  const isEdit = !!defaultValues?.id

  // Race fields
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

  // Track fields (create mode only — in edit, track is immutable)
  const [trackTitle, setTrackTitle] = useState(
    defaultValues?.track?.title ?? ''
  )
  const [trackDistance, setTrackDistance] = useState(
    defaultValues?.track?.distance?.toString() ?? ''
  )
  const [trackElevationGain, setTrackElevationGain] = useState(
    defaultValues?.track?.elevationGain?.toString() ?? ''
  )

  // File upload
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const existingLogoUrl = defaultValues?.logoId
    ? `/api/files/${defaultValues.logoId}`
    : null
  const existingBannerUrl = defaultValues?.bannerId
    ? `/api/files/${defaultValues.bannerId}`
    : null
  const [clearLogo, setClearLogo] = useState(false)
  const [clearBanner, setClearBanner] = useState(false)

  const [loading, setLoading] = useState(false)

  async function uploadIfNeeded(file: File | null): Promise<string | null> {
    if (!file) return null
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadFileAction(fd)
    return res?.id ?? null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !startAt || !endAt) {
      toast.error('Remplis les champs obligatoires')
      return
    }

    if (
      !isEdit &&
      (!trackTitle.trim() || !trackDistance || !trackElevationGain)
    ) {
      toast.error('Remplis les informations du parcours')
      return
    }

    setLoading(true)
    try {
      // Upload files
      const [uploadedLogoId, uploadedBannerId] = await Promise.all([
        uploadIfNeeded(logoFile),
        uploadIfNeeded(bannerFile),
      ])

      const resolvedLogoId = clearLogo
        ? null
        : (uploadedLogoId ?? defaultValues?.logoId ?? null)
      const resolvedBannerId = clearBanner
        ? null
        : (uploadedBannerId ?? defaultValues?.bannerId ?? null)

      // Create track (create mode only)
      let resolvedTrackId = defaultValues?.track?.id ?? ''
      if (!isEdit) {
        const trackRes = await createRaceTrackAction({
          title: trackTitle.trim(),
          distance: parseFloat(trackDistance),
          elevationGain: parseInt(trackElevationGain),
        })
        if (!trackRes.success) {
          toast.error('Erreur lors de la création du parcours')
          return
        }
        resolvedTrackId = trackRes.id
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
        trackId: resolvedTrackId,
        logoId: resolvedLogoId,
        bannerId: resolvedBannerId,
      }

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
      <div className="rounded-xl border border-border p-4 space-y-3">
        <p className="text-sm font-semibold">Parcours *</p>
        {isEdit ? (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {defaultValues?.track?.title}
            </span>
            {' — '}
            {defaultValues?.track?.distance?.toFixed(1)} km ·{' '}
            {defaultValues?.track?.elevationGain}m D+
            <p className="text-xs mt-1 opacity-70">
              Le parcours ne peut pas être modifié après création.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="trackTitle">Nom du parcours *</Label>
              <Input
                id="trackTitle"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Ex: Boucle des Crêtes"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trackDistance">Distance (km) *</Label>
              <Input
                id="trackDistance"
                type="number"
                min={0.1}
                step={0.1}
                value={trackDistance}
                onChange={(e) => setTrackDistance(e.target.value)}
                placeholder="Ex: 42.5"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trackElevation">Dénivelé (m D+) *</Label>
              <Input
                id="trackElevation"
                type="number"
                min={0}
                value={trackElevationGain}
                onChange={(e) => setTrackElevationGain(e.target.value)}
                placeholder="Ex: 1200"
              />
            </div>
          </div>
        )}
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
        <ImageField
          label="Logo"
          existingUrl={clearLogo ? null : existingLogoUrl}
          file={logoFile}
          onFile={(f) => {
            setLogoFile(f)
            setClearLogo(false)
          }}
          onClear={() => {
            setLogoFile(null)
            setClearLogo(true)
          }}
        />
        <ImageField
          label="Bannière"
          existingUrl={clearBanner ? null : existingBannerUrl}
          file={bannerFile}
          onFile={(f) => {
            setBannerFile(f)
            setClearBanner(false)
          }}
          onClear={() => {
            setBannerFile(null)
            setClearBanner(true)
          }}
        />
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
