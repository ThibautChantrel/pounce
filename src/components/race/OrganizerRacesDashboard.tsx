'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/navigation'
import {
  Pencil,
  Trash2,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { RaceStatus, RegistrationStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { deleteRaceAction } from '@/actions/race/race.actions'
import {
  validateRegistrationAction,
  updateRegistrationStatusAction,
} from '@/actions/race/registration.actions'
import type {
  RaceSummary,
  RegistrationSummary,
} from '@/actions/race/race.types'

const PENDING_STATUS_LABEL: Record<RaceStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_REVIEW: 'En attente de validation admin',
  ACTIVE: 'Active',
  CLOSED: 'Terminée',
  CANCELLED: 'Refusée / annulée',
}

type Props = { races: RaceSummary[] }

export function OrganizerRacesDashboard({ races }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette course ?')) return
    setLoading(id)
    const res = await deleteRaceAction(id)
    setLoading(null)
    if (res.success) {
      toast.success('Course supprimée')
      router.refresh()
    } else toast.error('Erreur lors de la suppression')
  }

  if (races.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-dashed border-border">
        <p className="text-muted-foreground text-sm mb-4">
          Aucune course organisée pour le moment
        </p>
        <Button asChild>
          <Link href="/races/create">Créer ma première course</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {races.map((race) => (
        <div
          key={race.id}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          {/* Race summary row */}
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{race.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {PENDING_STATUS_LABEL[race.status]}
                {race.adminRejectionReason && (
                  <span className="text-red-500 ml-1">
                    — {race.adminRejectionReason}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/races/${race.id}`}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/races/${race.id}/manage`}>
                  <Pencil className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(race.id)}
                disabled={loading === race.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {race.status === RaceStatus.ACTIVE && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpanded(expanded === race.id ? null : race.id)
                  }
                  className="gap-1"
                >
                  <Users className="w-4 h-4" />
                  {race.registrationCount}
                  {expanded === race.id ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Participants panel */}
          {expanded === race.id && <RegistrationsPanel raceId={race.id} />}
        </div>
      ))}
    </div>
  )
}

function RegistrationsPanel({ raceId }: { raceId: string }) {
  const [regs, setRegs] = useState<RegistrationSummary[] | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function load() {
    if (regs !== null) return
    setLoading(true)
    const { getRaceAction } = await import('@/actions/race/race.actions')
    const race = await getRaceAction(raceId)
    setRegs(race?.registrations ?? [])
    setLoading(false)
  }

  // Load on mount
  if (regs === null && !loading) load()

  async function handleValidate(registrationId: string) {
    const res = await validateRegistrationAction(registrationId)
    if (res.success) {
      toast.success('Inscription validée')
      router.refresh()
      setRegs(null)
    } else toast.error('Erreur')
  }

  async function handleStatus(
    registrationId: string,
    status: RegistrationStatus
  ) {
    const reason =
      status === RegistrationStatus.DISQUALIFIED
        ? prompt('Motif de disqualification ?')
        : undefined
    if (status === RegistrationStatus.DISQUALIFIED && !reason) return

    const res = await updateRegistrationStatusAction(
      registrationId,
      status,
      reason ?? undefined
    )
    if (res.success) {
      toast.success('Statut mis à jour')
      router.refresh()
      setRegs(null)
    } else toast.error('Erreur')
  }

  if (loading)
    return (
      <div className="px-4 pb-4 text-sm text-muted-foreground">
        Chargement...
      </div>
    )
  if (!regs || regs.length === 0)
    return (
      <div className="px-4 pb-4 text-sm text-muted-foreground">
        Aucun participant
      </div>
    )

  const STATUS_ICON: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-3.5 h-3.5 text-yellow-500" />,
    REGISTERED: <CheckCircle className="w-3.5 h-3.5 text-blue-500" />,
    VALIDATED: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
    DNF: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    DNS: <XCircle className="w-3.5 h-3.5 text-muted-foreground" />,
    DISQUALIFIED: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  }

  return (
    <div className="border-t border-border">
      <div className="px-4 py-3 space-y-2">
        {regs.map((reg) => (
          <div key={reg.id} className="flex items-center gap-3 text-sm py-1.5">
            <span className="shrink-0">{STATUS_ICON[reg.status]}</span>
            <span className="flex-1 min-w-0 truncate">
              {reg.user.firstName ?? ''} {reg.user.lastName ?? ''}
              {reg.user.pseudo ? (
                <span className="text-muted-foreground ml-1">
                  ({reg.user.pseudo})
                </span>
              ) : null}
            </span>
            <div className="flex gap-1 shrink-0">
              {reg.status === RegistrationStatus.PENDING && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-green-600"
                  onClick={() => handleValidate(reg.id)}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </Button>
              )}
              {(
                [
                  RegistrationStatus.REGISTERED,
                  RegistrationStatus.VALIDATED,
                ] as RegistrationStatus[]
              ).includes(reg.status) && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-muted-foreground"
                    onClick={() => handleStatus(reg.id, RegistrationStatus.DNF)}
                  >
                    DNF
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-muted-foreground"
                    onClick={() => handleStatus(reg.id, RegistrationStatus.DNS)}
                  >
                    DNS
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-red-500"
                    onClick={() =>
                      handleStatus(reg.id, RegistrationStatus.DISQUALIFIED)
                    }
                  >
                    DQ
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
