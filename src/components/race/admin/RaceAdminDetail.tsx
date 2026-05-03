'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/navigation'
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react'
import { RaceStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/navigation'
import {
  adminValidateRaceAction,
  adminRejectRaceAction,
} from '@/actions/race/race.admin.actions'
import type { RaceDetail } from '@/actions/race/race.types'

type Props = { race: RaceDetail }

export function RaceAdminDetail({ race }: Props) {
  const router = useRouter()
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleValidate() {
    setLoading(true)
    const res = await adminValidateRaceAction(race.id)
    setLoading(false)
    if (res.success) {
      toast.success('Course validée')
      router.refresh()
    } else toast.error('Erreur')
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error('Motif requis')
      return
    }
    setLoading(true)
    const res = await adminRejectRaceAction(race.id, rejectReason)
    setLoading(false)
    if (res.success) {
      toast.success('Course refusée')
      router.refresh()
    } else toast.error('Erreur')
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/races"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Courses
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{race.title}</h1>
          {race.status === RaceStatus.PENDING_REVIEW && (
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={handleValidate}
                disabled={loading}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Valider
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowReject(!showReject)}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" /> Refuser
              </Button>
            </div>
          )}
        </div>
      </div>

      {showReject && (
        <div className="flex gap-2 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du refus..."
            className="flex-1"
          />
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading}
          >
            Confirmer le refus
          </Button>
          <Button variant="ghost" onClick={() => setShowReject(false)}>
            Annuler
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          label="Organisateur"
          value={
            `${race.organizer.firstName ?? ''} ${race.organizer.lastName ?? ''}`.trim() ||
            race.organizer.pseudo ||
            'Inconnu'
          }
        />
        <InfoCard
          label="Format"
          value={
            race.format === 'BACKYARD'
              ? `Backyard — boucle toutes les ${race.loopDurationMinutes}min`
              : 'Course classique'
          }
        />
        <InfoCard
          label="Parcours"
          icon={<MapPin className="w-3.5 h-3.5" />}
          value={`${race.track.title} (${race.track.distance.toFixed(1)} km)`}
        />
        <InfoCard
          label="Participants"
          icon={<Users className="w-3.5 h-3.5" />}
          value={`${race.registrationCount}${race.maxParticipants ? ` / ${race.maxParticipants}` : ''}`}
        />
        <InfoCard
          label="Début"
          icon={<Calendar className="w-3.5 h-3.5" />}
          value={new Date(race.startAt).toLocaleString('fr-FR')}
        />
        <InfoCard
          label="Fin"
          icon={<Clock className="w-3.5 h-3.5" />}
          value={new Date(race.endAt).toLocaleString('fr-FR')}
        />
      </div>

      {race.description && (
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider text-[11px]">
            Description
          </p>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {race.description}
          </p>
        </div>
      )}

      {race.adminRejectionReason && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">
            Motif du refus
          </p>
          <p className="text-sm mt-1">{race.adminRejectionReason}</p>
        </div>
      )}
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
        {icon}
        {value}
      </p>
    </div>
  )
}
