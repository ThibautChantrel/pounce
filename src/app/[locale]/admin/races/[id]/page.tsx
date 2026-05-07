import { notFound } from 'next/navigation'
import ShowLayout from '@/components/admin/ShowLayout'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { Badge } from '@/components/ui/badge'
import { getRaceAction } from '@/actions/race/race.actions'
import { RaceAdminActions } from '@/components/race/admin/RaceAdminActions'
import { AdminRegistrationsTable } from '@/components/race/admin/AdminRegistrationsTable'
import { FormSection } from '@/components/race/RaceForm'
import { Users } from 'lucide-react'
import {
  ActivityMode,
  RaceAccessType,
  RaceFormat,
  RaceStatus,
} from '@prisma/client'
import Image from 'next/image'
import type { RaceDetail } from '@/actions/race/race.types'

type PageProps = { params: Promise<{ id: string }> }

const STATUS_MAP: Record<RaceStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Brouillon', className: 'bg-muted text-muted-foreground' },
  PENDING_REVIEW: {
    label: 'En attente de validation',
    className: 'bg-yellow-100 text-yellow-800',
  },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Terminée', className: 'bg-blue-100 text-blue-800' },
  CANCELLED: {
    label: 'Refusée / annulée',
    className: 'bg-red-100 text-red-800',
  },
}

const FORMAT_MAP: Record<RaceFormat, string> = {
  ONE_SHOT: 'Course classique',
  BACKYARD: 'Backyard Ultra',
}

const MODE_MAP: Record<ActivityMode, string> = {
  RUN: 'Course à pied',
  RIDE: 'Vélo',
  HYBRID: 'Hybride',
  OTHER: 'Autre',
}

const ACCESS_MAP: Record<RaceAccessType, string> = {
  PUBLIC_FREE: 'Public (inscription libre)',
  PUBLIC_VALIDATION: 'Public avec validation',
  PRIVATE: 'Privé (code)',
}

const raceFields: FieldConfig<RaceDetail>[] = [
  { label: 'Titre', key: 'title', type: 'string' },
  {
    label: 'Statut',
    type: 'custom',
    getValue: (r) => {
      const s = STATUS_MAP[r.status]
      return <Badge className={s.className}>{s.label}</Badge>
    },
  },
  {
    label: 'Format',
    type: 'custom',
    getValue: (r) =>
      r.format === RaceFormat.BACKYARD
        ? `${FORMAT_MAP.BACKYARD} — boucle toutes les ${r.loopDurationMinutes ?? '?'} min`
        : FORMAT_MAP.ONE_SHOT,
  },
  {
    label: 'Mode activité',
    type: 'custom',
    getValue: (r) => MODE_MAP[r.activityMode] ?? r.activityMode,
  },
  {
    label: 'Accès',
    type: 'custom',
    getValue: (r) =>
      r.accessType === RaceAccessType.PRIVATE
        ? `${ACCESS_MAP.PRIVATE}${r.accessCode ? ` — code: ${r.accessCode}` : ''}`
        : ACCESS_MAP[r.accessType],
  },
  {
    label: 'Parcours',
    type: 'custom',
    getValue: (r) =>
      `${r.track.title} — ${r.track.distance.toFixed(1)} km · ${r.track.elevationGain} m D+`,
  },
  {
    label: 'Organisateur',
    type: 'custom',
    getValue: (r) => {
      const name =
        `${r.organizer.firstName ?? ''} ${r.organizer.lastName ?? ''}`.trim()
      return name || r.organizer.pseudo || 'Inconnu'
    },
  },
  {
    label: 'Participants',
    type: 'custom',
    getValue: (r) =>
      `${r.registrationCount}${r.maxParticipants ? ` / ${r.maxParticipants}` : ''}`,
  },
  { label: 'Début', key: 'startAt', type: 'date' },
  { label: 'Fin', key: 'endAt', type: 'date' },
  {
    label: 'Description',
    type: 'custom',
    getValue: (r) =>
      r.description ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {r.description}
        </p>
      ) : null,
  },
  { label: 'Validé le', key: 'adminValidatedAt', type: 'date' },
  { label: 'Motif de refus', key: 'adminRejectionReason', type: 'string' },
  { label: 'Créé le', key: 'createdAt', type: 'date' },
  {
    label: 'Logo',
    type: 'custom',
    getValue: (r) =>
      r.logoId ? (
        <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border">
          <Image
            src={`/api/files/${r.logoId}`}
            alt="Logo"
            fill
            className="object-cover"
          />
        </div>
      ) : null,
  },
  {
    label: 'Bannière',
    type: 'custom',
    getValue: (r) =>
      r.bannerId ? (
        <div className="relative h-28 w-full max-w-sm rounded-xl overflow-hidden border border-border">
          <Image
            src={`/api/files/${r.bannerId}`}
            alt="Bannière"
            fill
            className="object-cover"
          />
        </div>
      ) : null,
  },
]

export default async function AdminRaceDetailPage({ params }: PageProps) {
  const { id } = await params
  const race = await getRaceAction(id)
  if (!race) notFound()

  return (
    <ShowLayout module="races">
      <div className="space-y-8">
        {/* Validation actions */}
        <RaceAdminActions race={{ id: race.id, status: race.status }} />

        {/* Race details */}
        <DataDetails
          title={race.title}
          description={`ID: ${race.id}`}
          data={race as unknown as Record<string, unknown>}
          fields={raceFields as FieldConfig<Record<string, unknown>>[]}
        />

        {/* Registrations */}
        <FormSection
          icon={<Users className="w-4 h-4" />}
          title={`Inscriptions (${race.registrationCount})`}
          description="Gestion complète des participants — statut, résultats, suppression."
        >
          <AdminRegistrationsTable
            raceId={id}
            raceFormat={race.format}
            registrations={race.registrations}
          />
        </FormSection>
      </div>
    </ShowLayout>
  )
}
