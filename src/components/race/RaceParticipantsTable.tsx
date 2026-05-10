'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/navigation'
import { CheckCircle, Map, Trophy, AlertTriangle } from 'lucide-react'
import { RaceFormat, RegistrationStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  validateRegistrationAction,
  updateRegistrationStatusAction,
  setRaceResultAction,
  addBackyardLoopAction,
} from '@/actions/race/registration.actions'
import { ArbitrageDialog } from './ArbitrageDialog'
import type { RegistrationSummary } from '@/actions/race/race.types'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: 'En attente',
  REGISTERED: 'Inscrit',
  VALIDATED: 'Validé',
  DNF: 'DNF',
  DNS: 'DNS',
  DISQUALIFIED: 'DQ',
}

const STATUS_VARIANT: Record<
  RegistrationStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  REGISTERED: 'secondary',
  VALIDATED: 'default',
  DNF: 'destructive',
  DNS: 'secondary',
  DISQUALIFIED: 'destructive',
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}h${m.toString().padStart(2, '0')}'${sec.toString().padStart(2, '0')}"`
}

function parseTime(str: string): number | null {
  const parts = str.split(':').map(Number)
  if (parts.some(isNaN)) return null
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60
  return null
}

type Props = {
  raceId: string
  raceFormat: RaceFormat
  registrations: RegistrationSummary[]
  isOrganizer?: boolean
}

export function RaceParticipantsTable({
  raceId,
  raceFormat,
  registrations,
  isOrganizer = false,
}: Props) {
  const router = useRouter()
  const [resultForm, setResultForm] = useState<string | null>(null)
  const [rankInput, setRankInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [loopForm, setLoopForm] = useState<string | null>(null)
  const [loopTimeInput, setLoopTimeInput] = useState('')
  const [arbitrage, setArbitrage] = useState<{
    registrationId: string
    name: string
  } | null>(null)
  const [pendingStatus, setPendingStatus] = useState<{
    registrationId: string
    participantName: string
    status: 'DNF' | 'DNS' | 'DISQUALIFIED'
    dqReason: string
  } | null>(null)

  if (registrations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Aucun participant inscrit
      </p>
    )
  }

  const sorted = [...registrations].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank
    if (a.rank) return -1
    if (b.rank) return 1
    if (raceFormat === RaceFormat.BACKYARD) {
      const aLoops = a.backyardLoops.filter(
        (l) => l.status === 'VALIDATED'
      ).length
      const bLoops = b.backyardLoops.filter(
        (l) => l.status === 'VALIDATED'
      ).length
      return bLoops - aLoops
    }
    return (
      new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
    )
  })

  async function handleValidate(id: string) {
    const res = await validateRegistrationAction(id)
    if (res.success) {
      toast.success('Inscription validée')
      router.refresh()
    } else toast.error('Erreur')
  }

  function requestStatus(
    id: string,
    name: string,
    status: 'DNF' | 'DNS' | 'DISQUALIFIED'
  ) {
    setPendingStatus({
      registrationId: id,
      participantName: name,
      status,
      dqReason: '',
    })
  }

  async function confirmStatus() {
    if (!pendingStatus) return
    const { registrationId, status, dqReason } = pendingStatus
    if (status === RegistrationStatus.DISQUALIFIED && !dqReason.trim()) {
      toast.error('Le motif est obligatoire pour une disqualification')
      return
    }
    const res = await updateRegistrationStatusAction(
      registrationId,
      status,
      status === RegistrationStatus.DISQUALIFIED ? dqReason : undefined
    )
    setPendingStatus(null)
    if (res.success) {
      toast.success('Statut mis à jour')
      router.refresh()
    } else toast.error('Erreur')
  }

  async function handleAddLoop(id: string) {
    const seconds = parseTime(loopTimeInput)
    if (!seconds) {
      toast.error('Format invalide — ex: 1:23:45')
      return
    }
    const res = await addBackyardLoopAction(id, seconds)
    if (res.success) {
      toast.success('Boucle ajoutée')
      setLoopForm(null)
      setLoopTimeInput('')
      router.refresh()
    } else toast.error("Erreur lors de l'ajout")
  }

  async function handleSetResult(id: string) {
    const seconds = parseTime(timeInput)
    const rank = parseInt(rankInput)
    if (!seconds || isNaN(rank) || rank < 1) {
      toast.error('Format invalide — ex: 3:45:22 et rang 1')
      return
    }
    const res = await setRaceResultAction(id, rank, seconds)
    if (res.success) {
      const n = res.certifiedChallengeIds?.length ?? 0
      toast.success(
        n > 0
          ? `Résultat enregistré · ${n} défi(s) certifié(s)`
          : 'Résultat enregistré'
      )
      setResultForm(null)
      router.refresh()
    } else toast.error('Erreur')
  }

  const isOneShot = raceFormat === RaceFormat.ONE_SHOT
  const isBackyard = raceFormat === RaceFormat.BACKYARD

  const STATUS_DIALOG: Record<
    'DNF' | 'DNS' | 'DISQUALIFIED',
    { title: string; description: string; label: string }
  > = {
    DNF: {
      title: 'Marquer comme abandon (DNF) ?',
      description: `${pendingStatus?.participantName} sera marqué·e comme n'ayant pas terminé la course. Cette action est définitive et ne pourra pas être modifiée.`,
      label: "Confirmer l'abandon",
    },
    DNS: {
      title: 'Marquer comme non-partant (DNS) ?',
      description: `${pendingStatus?.participantName} sera marqué·e comme non-partant·e. Cette action est définitive et ne pourra pas être modifiée.`,
      label: 'Confirmer',
    },
    DISQUALIFIED: {
      title: 'Disqualifier le participant ?',
      description: `${pendingStatus?.participantName} sera disqualifié·e. Cette action est définitive et ne pourra pas être modifiée. Un motif est obligatoire.`,
      label: 'Disqualifier',
    },
  }

  return (
    <>
      {/* Status confirmation dialog */}
      {pendingStatus && (
        <AlertDialog
          open
          onOpenChange={(open) => !open && setPendingStatus(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                {STATUS_DIALOG[pendingStatus.status].title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {STATUS_DIALOG[pendingStatus.status].description}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {pendingStatus.status === RegistrationStatus.DISQUALIFIED && (
              <div className="px-1">
                <Input
                  placeholder="Motif de disqualification…"
                  value={pendingStatus.dqReason}
                  onChange={(e) =>
                    setPendingStatus((p) =>
                      p ? { ...p, dqReason: e.target.value } : p
                    )
                  }
                  className="mt-1"
                />
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmStatus}
              >
                {STATUS_DIALOG[pendingStatus.status].label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {arbitrage && (
        <ArbitrageDialog
          raceId={raceId}
          registrationId={arbitrage.registrationId}
          participantName={arbitrage.name}
          open={!!arbitrage}
          onClose={() => setArbitrage(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
              {isOneShot && <th className="text-left py-2 pr-3 w-8">#</th>}
              <th className="text-left py-2 pr-3">Participant</th>
              {isOneShot && <th className="text-right py-2 pr-3">Temps</th>}
              {isBackyard && <th className="text-center py-2 pr-3">Boucles</th>}
              <th className="text-left py-2 pr-3">Statut</th>
              {isOrganizer && <th className="text-right py-2">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((reg) => {
              const name =
                `${reg.user.firstName ?? ''} ${reg.user.lastName ?? ''}`.trim() ||
                reg.user.pseudo ||
                reg.user.email
              const validatedLoops = reg.backyardLoops.filter(
                (l) => l.status === 'VALIDATED'
              )
              const canManage =
                isOrganizer &&
                !(
                  [
                    RegistrationStatus.DNF,
                    RegistrationStatus.DNS,
                    RegistrationStatus.DISQUALIFIED,
                  ] as RegistrationStatus[]
                ).includes(reg.status)

              return (
                <>
                  <tr
                    key={reg.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {isOneShot && (
                      <td className="py-2.5 pr-3 font-bold text-muted-foreground text-xs w-8">
                        {reg.rank ? (
                          <span
                            className={
                              reg.rank === 1
                                ? 'text-amber-500'
                                : reg.rank === 2
                                  ? 'text-slate-400'
                                  : reg.rank === 3
                                    ? 'text-amber-700'
                                    : ''
                            }
                          >
                            {reg.rank === 1
                              ? '🥇'
                              : reg.rank === 2
                                ? '🥈'
                                : reg.rank === 3
                                  ? '🥉'
                                  : `#${reg.rank}`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    <td className="py-2.5 pr-3 font-medium">
                      {name}
                      {reg.user.pseudo && (
                        <span className="text-muted-foreground text-xs ml-1">
                          @{reg.user.pseudo}
                        </span>
                      )}
                      {reg.validationSource === 'AUTO' && (
                        <span className="ml-1.5 text-[10px] text-orange-500 font-semibold">
                          Strava
                        </span>
                      )}
                    </td>
                    {isOneShot && (
                      <td className="py-2.5 pr-3 text-right font-mono text-xs text-muted-foreground">
                        {reg.totalTimeSeconds
                          ? formatTime(reg.totalTimeSeconds)
                          : '—'}
                      </td>
                    )}
                    {isBackyard && (
                      <td className="py-2.5 pr-3 text-center font-semibold">
                        {validatedLoops.length > 0 ? (
                          <span className="flex items-center justify-center gap-1">
                            {validatedLoops.length}
                            <Trophy className="w-3 h-3 text-amber-500" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                    )}
                    <td className="py-2.5 pr-3">
                      <Badge
                        variant={STATUS_VARIANT[reg.status]}
                        className="text-[10px]"
                      >
                        {reg.validationSource === 'AUTO' &&
                        reg.status === 'VALIDATED' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Auto
                          </>
                        ) : (
                          STATUS_LABEL[reg.status]
                        )}
                      </Badge>
                    </td>
                    {isOrganizer && (
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
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
                          {reg.stravaActivityId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-blue-500"
                              onClick={() =>
                                setArbitrage({ registrationId: reg.id, name })
                              }
                            >
                              <Map className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canManage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-destructive"
                              onClick={() =>
                                requestStatus(
                                  reg.id,
                                  name,
                                  RegistrationStatus.DISQUALIFIED
                                )
                              }
                            >
                              DQ
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Inline result form */}
                  {resultForm === reg.id && (
                    <tr key={`${reg.id}-form`}>
                      <td colSpan={isOrganizer ? 5 : 4} className="py-2 px-0">
                        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                          <span className="text-xs text-muted-foreground shrink-0">
                            Rang
                          </span>
                          <Input
                            value={rankInput}
                            onChange={(e) => setRankInput(e.target.value)}
                            placeholder="1"
                            className="h-7 w-16 text-xs"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">
                            Temps
                          </span>
                          <Input
                            value={timeInput}
                            onChange={(e) => setTimeInput(e.target.value)}
                            placeholder="HH:MM:SS"
                            className="h-7 w-28 text-xs font-mono"
                          />
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => handleSetResult(reg.id)}
                          >
                            Enregistrer
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => setResultForm(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Inline loop form */}
                  {loopForm === reg.id && (
                    <tr key={`${reg.id}-loop-form`}>
                      <td colSpan={isOrganizer ? 4 : 3} className="py-2 px-0">
                        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                          <span className="text-xs text-muted-foreground shrink-0">
                            Temps boucle
                          </span>
                          <Input
                            value={loopTimeInput}
                            onChange={(e) => setLoopTimeInput(e.target.value)}
                            placeholder="H:MM:SS"
                            className="h-7 w-28 text-xs font-mono"
                          />
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => handleAddLoop(reg.id)}
                          >
                            Ajouter
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => setLoopForm(null)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Backyard loops detail */}
                  {isBackyard && validatedLoops.length > 0 && (
                    <tr key={`${reg.id}-loops`} className="bg-muted/10">
                      <td
                        colSpan={isOrganizer ? 4 : 3}
                        className="pb-2 pt-0 px-3"
                      >
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {validatedLoops.map((loop) => (
                            <span
                              key={loop.loopNumber}
                              className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                            >
                              Boucle {loop.loopNumber}
                              {loop.timeSeconds
                                ? ` — ${formatTime(loop.timeSeconds)}`
                                : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
