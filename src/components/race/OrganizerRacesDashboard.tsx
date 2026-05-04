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
import { Input } from '@/components/ui/input'
import { Link } from '@/navigation'
import { deleteRaceAction } from '@/actions/race/race.actions'
import {
  validateRegistrationAction,
  updateRegistrationStatusAction,
  setRaceResultAction,
} from '@/actions/race/registration.actions'
import { ManualRaceSyncButton } from './ManualRaceSyncButton'
import { ArbitrageDialog } from './ArbitrageDialog'
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
          {expanded === race.id && (
            <RegistrationsPanel raceId={race.id} raceName={race.title} />
          )}
        </div>
      ))}
    </div>
  )
}

function RegistrationsPanel({
  raceId,
  raceName,
}: {
  raceId: string
  raceName: string
}) {
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

  async function handleSetResult(
    registrationId: string,
    rank: number,
    totalTimeSeconds: number
  ) {
    const res = await setRaceResultAction(
      registrationId,
      rank,
      totalTimeSeconds
    )
    if (res.success) {
      const challenges = res.certifiedChallengeIds?.length ?? 0
      toast.success(
        challenges > 0
          ? `Résultat enregistré · ${challenges} défi(s) certifié(s) !`
          : 'Résultat enregistré et certification créée'
      )
      router.refresh()
      setRegs(null)
    } else toast.error('Erreur lors de la saisie du résultat')
  }

  if (loading)
    return (
      <div className="px-4 pb-4 text-sm text-muted-foreground">
        Chargement...
      </div>
    )

  return (
    <div className="border-t border-border">
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Participants
        </p>
        <ManualRaceSyncButton raceId={raceId} />
      </div>
      {!regs || regs.length === 0 ? (
        <div className="px-4 pb-4 text-sm text-muted-foreground">
          Aucun participant
        </div>
      ) : (
        <RegistrationsList
          raceId={raceId}
          regs={regs}
          onValidate={handleValidate}
          onStatus={handleStatus}
          onSetResult={handleSetResult}
        />
      )}
    </div>
  )
}

function parseTimeToSeconds(timeStr: string): number | null {
  const parts = timeStr.split(':').map(Number)
  if (parts.some(isNaN)) return null
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60
  return null
}

function RegistrationsList({
  raceId,
  regs,
  onValidate,
  onStatus,
  onSetResult,
}: {
  raceId: string
  regs: RegistrationSummary[]
  onValidate: (id: string) => void
  onStatus: (id: string, status: RegistrationStatus) => void
  onSetResult: (id: string, rank: number, seconds: number) => void
}) {
  const [resultForm, setResultForm] = useState<string | null>(null)
  const [timeInput, setTimeInput] = useState('')
  const [rankInput, setRankInput] = useState('')
  const [arbitrage, setArbitrage] = useState<{
    registrationId: string
    participantName: string
  } | null>(null)

  const STATUS_ICON: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-3.5 h-3.5 text-yellow-500" />,
    REGISTERED: <CheckCircle className="w-3.5 h-3.5 text-blue-500" />,
    VALIDATED: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
    DNF: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    DNS: <XCircle className="w-3.5 h-3.5 text-muted-foreground" />,
    DISQUALIFIED: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  }

  function openResultForm(id: string) {
    setResultForm(id)
    setTimeInput('')
    setRankInput('')
  }

  function submitResult(id: string) {
    const seconds = parseTimeToSeconds(timeInput)
    const rank = parseInt(rankInput)
    if (!seconds || isNaN(rank) || rank < 1) {
      toast.error('Format invalide — ex: 3:45:22 et rang 1')
      return
    }
    onSetResult(id, rank, seconds)
    setResultForm(null)
  }

  const participantName = (reg: RegistrationSummary) =>
    `${reg.user.firstName ?? ''} ${reg.user.lastName ?? ''}`.trim() ||
    reg.user.pseudo ||
    'Participant'

  return (
    <>
      {arbitrage && (
        <ArbitrageDialog
          raceId={raceId}
          registrationId={arbitrage.registrationId}
          participantName={arbitrage.participantName}
          open={!!arbitrage}
          onClose={() => setArbitrage(null)}
        />
      )}
      <div className="px-4 py-3 space-y-2">
        {regs.map((reg) => (
          <div key={reg.id} className="space-y-1.5">
            <div className="flex items-center gap-3 text-sm py-1">
              <span className="shrink-0">{STATUS_ICON[reg.status]}</span>
              <span className="flex-1 min-w-0 truncate">
                {reg.user.firstName ?? ''} {reg.user.lastName ?? ''}
                {reg.user.pseudo ? (
                  <span className="text-muted-foreground ml-1">
                    ({reg.user.pseudo})
                  </span>
                ) : null}
                {reg.rank && reg.totalTimeSeconds ? (
                  <span className="text-muted-foreground ml-2 text-xs">
                    #{reg.rank} — {formatTime(reg.totalTimeSeconds)}
                  </span>
                ) : null}
              </span>
              <div className="flex gap-1 shrink-0">
                {reg.status === RegistrationStatus.PENDING && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-green-600"
                    onClick={() => onValidate(reg.id)}
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
                      className="h-7 px-2 text-primary text-xs"
                      onClick={() => openResultForm(reg.id)}
                    >
                      Résultat
                    </Button>
                    {reg.stravaActivityId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-blue-500 text-xs"
                        onClick={() =>
                          setArbitrage({
                            registrationId: reg.id,
                            participantName: participantName(reg),
                          })
                        }
                      >
                        Trace
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-muted-foreground"
                      onClick={() => onStatus(reg.id, RegistrationStatus.DNF)}
                    >
                      DNF
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-muted-foreground"
                      onClick={() => onStatus(reg.id, RegistrationStatus.DNS)}
                    >
                      DNS
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-red-500"
                      onClick={() =>
                        onStatus(reg.id, RegistrationStatus.DISQUALIFIED)
                      }
                    >
                      DQ
                    </Button>
                  </>
                )}
              </div>
            </div>

            {resultForm === reg.id && (
              <div className="flex items-center gap-2 pl-6 pb-1">
                <Input
                  value={rankInput}
                  onChange={(e) => setRankInput(e.target.value)}
                  placeholder="Rang (1)"
                  className="h-7 w-20 text-xs"
                />
                <Input
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  placeholder="HH:MM:SS"
                  className="h-7 w-28 text-xs font-mono"
                />
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => submitResult(reg.id)}
                >
                  OK
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setResultForm(null)}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}h${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`
}
