'use client'

import { useRef, useState } from 'react'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import {
  ActivityMode,
  RaceAccessType,
  RaceFormat,
  RaceStatus,
} from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadFileAction } from '@/actions/file/file.admin.actions'
import {
  createRaceAction,
  updateRaceAction,
  createRaceTrackAction,
} from '@/actions/race/race.actions'
import {
  adminCreateRaceAction,
  adminUpdateRaceAction,
} from '@/actions/race/race.admin.actions'
import type { CreateRaceInput, RaceSummary } from '@/actions/race/race.types'
import {
  RefreshCw,
  Zap,
  ImageIcon,
  X,
  Info,
  Calendar,
  Globe,
  Settings2,
  Image as ImageLucide,
  Map,
  Lock,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { TrackSelector, TrackSelectorValue } from './TrackSelector'
import { UserSelector, UserSelectorValue } from './admin/UserSelector'

// ─── Section card wrapper ───────────────────────────────────────────────────

export function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border">
      <div className="px-5 py-4 bg-muted/40 border-b border-border rounded-t-2xl">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

// ─── Image field ────────────────────────────────────────────────────────────

function ImageField({
  label,
  existingUrl,
  file,
  onFile,
  onClear,
}: {
  label: string
  existingUrl?: string | null
  file: File | null
  onFile: (f: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : existingUrl

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border h-28 bg-muted">
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
          className="w-full h-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-xs">Cliquer pour sélectionner</span>
        </button>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(d?: Date | null) {
  if (!d) return ''
  const dt = new Date(d)
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString().slice(0, 16)
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS: { value: ActivityMode; label: string }[] = [
  { value: ActivityMode.RUN, label: 'Course à pied' },
  { value: ActivityMode.RIDE, label: 'Vélo' },
  { value: ActivityMode.HYBRID, label: 'Mixte' },
]

const ACCESS_OPTIONS: {
  value: RaceAccessType
  icon: React.ReactNode
  label: string
  desc: string
}[] = [
  {
    value: RaceAccessType.PUBLIC_FREE,
    icon: <Globe className="w-4 h-4" />,
    label: 'Publique libre',
    desc: 'Inscription ouverte à tous',
  },
  {
    value: RaceAccessType.PUBLIC_VALIDATION,
    icon: <Users className="w-4 h-4" />,
    label: 'Sur validation',
    desc: "L'organisateur valide chaque inscription",
  },
  {
    value: RaceAccessType.PRIVATE,
    icon: <Lock className="w-4 h-4" />,
    label: 'Privée',
    desc: 'Accès par code uniquement',
  },
]

const STATUS_OPTIONS: { value: RaceStatus; label: string; color: string }[] = [
  {
    value: RaceStatus.DRAFT,
    label: 'Brouillon',
    color: 'text-muted-foreground',
  },
  {
    value: RaceStatus.PENDING_REVIEW,
    label: 'En attente',
    color: 'text-amber-600',
  },
  { value: RaceStatus.ACTIVE, label: 'Active', color: 'text-green-600' },
  { value: RaceStatus.CLOSED, label: 'Clôturée', color: 'text-slate-500' },
  { value: RaceStatus.CANCELLED, label: 'Annulée', color: 'text-destructive' },
]

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  defaultValues?: Partial<
    RaceSummary & { id: string; accessCode?: string | null }
  >
  adminMode?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RaceForm({ defaultValues, adminMode = false }: Props) {
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
  const [accessCode, setAccessCode] = useState(defaultValues?.accessCode ?? '')
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

  // Admin-only fields
  const existingOrganizer = defaultValues?.organizer
  const [organizerValue, setOrganizerValue] = useState<UserSelectorValue>(
    existingOrganizer
      ? {
          userId: existingOrganizer.id,
          name:
            `${existingOrganizer.firstName ?? ''} ${existingOrganizer.lastName ?? ''}`.trim() ||
            existingOrganizer.pseudo ||
            '',
          email: '',
        }
      : null
  )
  const [adminStatus, setAdminStatus] = useState<RaceStatus>(
    defaultValues?.status ?? RaceStatus.ACTIVE
  )

  // Track selector
  const [trackValue, setTrackValue] = useState<TrackSelectorValue | null>(
    !isEdit
      ? {
          mode: 'new',
          title: '',
          distance: '',
          elevationGain: '',
          gpxFile: null,
        }
      : null
  )

  // Media
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

    if (adminMode && !organizerValue) {
      toast.error('Sélectionne un organisateur')
      return
    }

    if (!isEdit) {
      if (!trackValue) {
        toast.error('Sélectionne ou crée un parcours')
        return
      }
      if (trackValue.mode === 'existing' && !trackValue.trackId) {
        toast.error('Sélectionne un parcours dans la liste')
        return
      }
      if (trackValue.mode === 'new') {
        if (
          !trackValue.title.trim() ||
          !trackValue.distance ||
          !trackValue.elevationGain
        ) {
          toast.error('Remplis les informations du parcours')
          return
        }
      }
    }

    setLoading(true)
    try {
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

      // Resolve trackId
      let resolvedTrackId = defaultValues?.track?.id ?? ''
      if (!isEdit && trackValue) {
        if (trackValue.mode === 'existing') {
          resolvedTrackId = trackValue.trackId
        } else {
          const gpxFileId = await uploadIfNeeded(trackValue.gpxFile)
          const trackRes = await createRaceTrackAction({
            title: trackValue.title.trim(),
            distance: parseFloat(trackValue.distance),
            elevationGain: parseInt(trackValue.elevationGain),
            gpxFileId,
          })
          if (!trackRes.success) {
            toast.error('Erreur lors de la création du parcours')
            return
          }
          resolvedTrackId = trackRes.id
        }
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

      let result: { success: boolean; id?: string }

      if (adminMode) {
        if (isEdit) {
          result = await adminUpdateRaceAction({
            ...data,
            id: defaultValues!.id!,
            organizerId: organizerValue!.userId,
            status: adminStatus,
          })
        } else {
          result = await adminCreateRaceAction({
            ...data,
            organizerId: organizerValue!.userId,
          })
        }
      } else {
        result = isEdit
          ? await updateRaceAction({ ...data, id: defaultValues!.id! })
          : await createRaceAction(data)
      }

      if (!result.success) {
        toast.error("Erreur lors de l'enregistrement")
        return
      }

      toast.success(
        isEdit
          ? 'Course mise à jour'
          : adminMode
            ? 'Course créée'
            : 'Course soumise pour validation'
      )

      if (adminMode) {
        router.push(
          isEdit ? `/admin/races/${defaultValues!.id}` : '/admin/races'
        )
      } else {
        router.push(
          isEdit ? `/races/${defaultValues!.id}/manage` : '/profile/races'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Admin : Organisateur ── */}
      {adminMode && (
        <FormSection
          icon={<ShieldCheck className="w-4 h-4" />}
          title="Organisateur *"
          description="Utilisateur responsable de cette course."
        >
          <UserSelector
            value={organizerValue}
            onChange={setOrganizerValue}
            placeholder="Rechercher par nom, email ou pseudo…"
          />
        </FormSection>
      )}

      {/* ── Admin : Statut ── */}
      {adminMode && isEdit && (
        <FormSection
          icon={<ShieldCheck className="w-4 h-4" />}
          title="Statut de la course"
          description="Modifie le statut directement (admin uniquement)."
        >
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setAdminStatus(s.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                  adminStatus === s.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </FormSection>
      )}

      {/* ── Format ── */}
      <FormSection
        icon={<Zap className="w-4 h-4" />}
        title="Format de la course"
        description={
          isEdit
            ? 'Le format ne peut pas être modifié après création.'
            : undefined
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              disabled={isEdit}
              onClick={() => setFormat(f.value)}
              className={cn(
                'flex flex-col gap-1 p-4 rounded-xl border text-left transition-all',
                format === f.value
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50',
                isEdit && 'opacity-60 cursor-not-allowed'
              )}
            >
              <span className="flex items-center gap-2 font-semibold text-sm">
                {f.icon} {f.label}
              </span>
              <span className="text-xs">{f.desc}</span>
            </button>
          ))}
        </div>
      </FormSection>

      {/* ── Informations générales ── */}
      <FormSection
        icon={<Info className="w-4 h-4" />}
        title="Informations générales"
      >
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
            placeholder="Décris ta course…"
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
      </FormSection>

      {/* ── Parcours ── */}
      <FormSection
        icon={<Map className="w-4 h-4" />}
        title="Parcours *"
        description={
          isEdit
            ? undefined
            : 'Sélectionne un parcours existant ou crée-en un nouveau.'
        }
      >
        {isEdit ? (
          <TrackSelector
            value={null}
            onChange={() => {}}
            readOnly={defaultValues?.track}
          />
        ) : (
          <TrackSelector value={trackValue} onChange={setTrackValue} />
        )}
      </FormSection>

      {/* ── Dates ── */}
      <FormSection
        icon={<Calendar className="w-4 h-4" />}
        title="Dates et durée"
      >
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
              className="max-w-xs"
            />
          </div>
        )}
      </FormSection>

      {/* ── Accès ── */}
      <FormSection icon={<Lock className="w-4 h-4" />} title="Mode d'accès *">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ACCESS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setAccessType(o.value)}
              className={cn(
                'flex flex-col gap-1.5 p-3.5 rounded-xl border text-left transition-all',
                accessType === o.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              <span
                className={cn(
                  'flex items-center gap-2 text-sm font-semibold',
                  accessType === o.value
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {o.icon} {o.label}
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
              className="max-w-xs"
            />
          </div>
        )}
      </FormSection>

      {/* ── Options ── */}
      <FormSection
        icon={<Settings2 className="w-4 h-4" />}
        title="Options"
        description="Paramètres complémentaires de la course."
      >
        <div className="space-y-1.5">
          <Label htmlFor="maxParticipants">
            Nombre max de participants{' '}
            <span className="text-muted-foreground font-normal">
              (vide = illimité)
            </span>
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
      </FormSection>

      {/* ── Médias ── */}
      <FormSection
        icon={<ImageLucide className="w-4 h-4" />}
        title="Médias"
        description="Logo et bannière affichés sur la page de la course."
      >
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
      </FormSection>

      {/* ── Submit ── */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Enregistrement…'
            : isEdit
              ? 'Mettre à jour'
              : adminMode
                ? 'Créer la course'
                : 'Soumettre la course'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
