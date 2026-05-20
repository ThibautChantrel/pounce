'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/navigation'
import { RaceFormat, RegistrationStatus } from '@prisma/client'
import { Trophy, Trash2, AlertTriangle } from 'lucide-react'
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
  adminCreateRegistrationAction,
  adminUpdateRegistrationAction,
  adminDeleteRegistrationAction,
} from '@/actions/race/race.admin.actions'
import { addBackyardLoopAction } from '@/actions/race/registration.actions'
import type { RegistrationSummary } from '@/actions/race/race.types'
import { UserSelector, UserSelectorValue } from './UserSelector'

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: 'En attente',
  REGISTERED: 'Inscrit',
  VALIDATED: 'Validé',
  DNF: 'DNF',
  DNS: 'DNS',
  DISQUALIFIED: 'DQ',
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

function parseNullableNumber(str: string): number | null {
  const trimmed = str.trim()
  if (!trimmed) return null
  const value = Number(trimmed.replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

function parseNullableInt(str: string): number | null {
  const trimmed = str.trim()
  if (!trimmed) return null
  const value = Number.parseInt(trimmed, 10)
  return Number.isFinite(value) ? value : null
}

function parseNullableDate(str: string): Date | null {
  const trimmed = str.trim()
  if (!trimmed) return null
  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

type Props = {
  raceId: string
  raceFormat: RaceFormat
  registrations: RegistrationSummary[]
}

export function AdminRegistrationsTable({
  raceId,
  raceFormat,
  registrations,
}: Props) {
  const router = useRouter()
  const [savingStatus, setSavingStatus] = useState<string | null>(null)
  const [resultForm, setResultForm] = useState<string | null>(null)
  const [rankInput, setRankInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [avgSpeedInput, setAvgSpeedInput] = useState('')
  const [maxSpeedInput, setMaxSpeedInput] = useState('')
  const [heartRateAvgInput, setHeartRateAvgInput] = useState('')
  const [heartRateMaxInput, setHeartRateMaxInput] = useState('')
  const [caloriesInput, setCaloriesInput] = useState('')
  const [finishedAtInput, setFinishedAtInput] = useState('')
  const [loopForm, setLoopForm] = useState<string | null>(null)
  const [loopTimeInput, setLoopTimeInput] = useState('')
  const [loopAvgSpeedInput, setLoopAvgSpeedInput] = useState('')
  const [loopHeartRateAvgInput, setLoopHeartRateAvgInput] = useState('')
  const [loopHeartRateMaxInput, setLoopHeartRateMaxInput] = useState('')
  const [loopStartedAtInput, setLoopStartedAtInput] = useState('')
  const [loopCompletedAtInput, setLoopCompletedAtInput] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserSelectorValue>(null)
  const [addingUser, setAddingUser] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  const isOneShot = raceFormat === RaceFormat.ONE_SHOT
  const isBackyard = raceFormat === RaceFormat.BACKYARD

  const sorted = [...registrations].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank
    if (a.rank) return -1
    if (b.rank) return 1
    return (
      new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
    )
  })

  async function handleStatusChange(id: string, status: RegistrationStatus) {
    setSavingStatus(id)
    const res = await adminUpdateRegistrationAction(id, { status })
    setSavingStatus(null)
    if (res.success) {
      toast.success('Statut mis à jour')
      router.refresh()
    } else {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  async function handleSetResult(id: string) {
    const seconds = parseTime(timeInput)
    const rank = parseInt(rankInput)
    if (!seconds || isNaN(rank) || rank < 1) {
      toast.error('Format invalide — ex: 3:45:22 et rang 1')
      return
    }

    const avgSpeed = parseNullableNumber(avgSpeedInput)
    const maxSpeed = parseNullableNumber(maxSpeedInput)
    const heartRateAvg = parseNullableInt(heartRateAvgInput)
    const heartRateMax = parseNullableInt(heartRateMaxInput)
    const calories = parseNullableInt(caloriesInput)
    const finishedAt = parseNullableDate(finishedAtInput)

    if (avgSpeedInput.trim() && avgSpeed === null) {
      toast.error('Allure/Vitesse moyenne invalide')
      return
    }
    if (maxSpeedInput.trim() && maxSpeed === null) {
      toast.error('Vitesse max invalide')
      return
    }
    if (heartRateAvgInput.trim() && heartRateAvg === null) {
      toast.error('BPM moyen invalide')
      return
    }
    if (heartRateMaxInput.trim() && heartRateMax === null) {
      toast.error('BPM max invalide')
      return
    }
    if (caloriesInput.trim() && calories === null) {
      toast.error('Calories invalides')
      return
    }
    if (finishedAtInput.trim() && !finishedAt) {
      toast.error('Date/heure de fin invalide')
      return
    }

    const res = await adminUpdateRegistrationAction(id, {
      rank,
      totalTimeSeconds: seconds,
      status: RegistrationStatus.VALIDATED,
      validatedAt: finishedAt ?? new Date(),
      finishedAt: finishedAt ?? new Date(),
      avgSpeed: avgSpeed ?? undefined,
      maxSpeed: maxSpeed ?? undefined,
      heartRateAvg: heartRateAvg ?? undefined,
      heartRateMax: heartRateMax ?? undefined,
      calories: calories ?? undefined,
    })
    if (res.success) {
      toast.success('Résultat enregistré')
      setResultForm(null)
      setAvgSpeedInput('')
      setMaxSpeedInput('')
      setHeartRateAvgInput('')
      setHeartRateMaxInput('')
      setCaloriesInput('')
      setFinishedAtInput('')
      router.refresh()
    } else {
      toast.error('Erreur')
    }
  }

  async function handleAddLoop(id: string) {
    const seconds = parseTime(loopTimeInput)
    if (!seconds) {
      toast.error('Format invalide — ex: 1:23:45')
      return
    }
    const avgSpeed = parseNullableNumber(loopAvgSpeedInput)
    const heartRateAvg = parseNullableInt(loopHeartRateAvgInput)
    const heartRateMax = parseNullableInt(loopHeartRateMaxInput)
    const startedAt = parseNullableDate(loopStartedAtInput)
    const completedAt = parseNullableDate(loopCompletedAtInput)

    if (loopAvgSpeedInput.trim() && avgSpeed === null) {
      toast.error('Vitesse moyenne boucle invalide')
      return
    }
    if (loopHeartRateAvgInput.trim() && heartRateAvg === null) {
      toast.error('BPM moyen boucle invalide')
      return
    }
    if (loopHeartRateMaxInput.trim() && heartRateMax === null) {
      toast.error('BPM max boucle invalide')
      return
    }
    if (loopStartedAtInput.trim() && !startedAt) {
      toast.error('Date/heure de départ invalide')
      return
    }
    if (loopCompletedAtInput.trim() && !completedAt) {
      toast.error('Date/heure d’arrivée invalide')
      return
    }

    const res = await addBackyardLoopAction(id, seconds, {
      avgSpeed,
      heartRateAvg,
      heartRateMax,
      startedAt,
      completedAt,
    })
    if (res.success) {
      toast.success('Boucle ajoutée')
      setLoopForm(null)
      setLoopTimeInput('')
      setLoopAvgSpeedInput('')
      setLoopHeartRateAvgInput('')
      setLoopHeartRateMaxInput('')
      setLoopStartedAtInput('')
      setLoopCompletedAtInput('')
      router.refresh()
    } else {
      toast.error("Erreur lors de l'ajout")
    }
  }

  async function handleManualRegistration() {
    if (!selectedUser) {
      toast.error('Sélectionne un utilisateur')
      return
    }
    setAddingUser(true)
    const res = await adminCreateRegistrationAction(raceId, selectedUser.userId)
    setAddingUser(false)
    if (res.success) {
      toast.success('Participant inscrit manuellement')
      setSelectedUser(null)
      router.refresh()
      return
    }
    if (res.error === 'already_registered') {
      toast.error('Ce participant est déjà inscrit')
      return
    }
    if (res.error === 'race_full') {
      toast.error('La course est complète')
      return
    }
    toast.error("Erreur lors de l'inscription")
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await adminDeleteRegistrationAction(deleteTarget.id)
    setDeleteTarget(null)
    if (res.success) {
      toast.success('Inscription supprimée')
      router.refresh()
    } else {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <>
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer l&apos;inscription ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;inscription de <strong>{deleteTarget?.name}</strong> sera
              définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-xl border border-border bg-muted/20 p-3 mb-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ajouter un participant manuellement
        </p>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="flex-1">
            <UserSelector
              value={selectedUser}
              onChange={setSelectedUser}
              placeholder="Rechercher par nom, email ou pseudo..."
            />
          </div>
          <Button
            size="sm"
            className="h-9"
            onClick={handleManualRegistration}
            disabled={addingUser}
          >
            {addingUser ? 'Ajout...' : 'Inscrire'}
          </Button>
        </div>
      </div>

      {registrations.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Aucune inscription pour cette course.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                {isOneShot && <th className="text-left py-2 pr-3 w-8">#</th>}
                <th className="text-left py-2 pr-3">Participant</th>
                <th className="text-left py-2 pr-3">Email</th>
                {isOneShot && <th className="text-right py-2 pr-3">Temps</th>}
                {isBackyard && (
                  <th className="text-center py-2 pr-3">Boucles</th>
                )}
                <th className="text-left py-2 pr-3">Statut</th>
                <th className="text-right py-2">Actions</th>
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
                      </td>

                      <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                        {reg.user.email}
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
                        <select
                          value={reg.status}
                          disabled={savingStatus === reg.id}
                          onChange={(e) =>
                            handleStatusChange(
                              reg.id,
                              e.target.value as RegistrationStatus
                            )
                          }
                          className="text-xs rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                        >
                          {Object.entries(STATUS_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isOneShot && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-primary"
                              onClick={() => {
                                setResultForm(
                                  resultForm === reg.id ? null : reg.id
                                )
                                setRankInput(reg.rank ? String(reg.rank) : '')
                                setTimeInput(
                                  reg.totalTimeSeconds
                                    ? `${Math.floor(reg.totalTimeSeconds / 3600)}:${String(Math.floor((reg.totalTimeSeconds % 3600) / 60)).padStart(2, '0')}:${String(reg.totalTimeSeconds % 60).padStart(2, '0')}`
                                    : ''
                                )
                                setAvgSpeedInput('')
                                setMaxSpeedInput('')
                                setHeartRateAvgInput('')
                                setHeartRateMaxInput('')
                                setCaloriesInput('')
                                setFinishedAtInput('')
                              }}
                            >
                              Résultat
                            </Button>
                          )}
                          {isBackyard && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-primary"
                              onClick={() => {
                                setLoopForm(loopForm === reg.id ? null : reg.id)
                                setLoopTimeInput('')
                                setLoopAvgSpeedInput('')
                                setLoopHeartRateAvgInput('')
                                setLoopHeartRateMaxInput('')
                                setLoopStartedAtInput('')
                                setLoopCompletedAtInput('')
                              }}
                            >
                              + Boucle
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() =>
                              setDeleteTarget({ id: reg.id, name })
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline result form */}
                    {resultForm === reg.id && (
                      <tr key={`${reg.id}-result`}>
                        <td colSpan={6} className="py-2 px-0">
                          <div className="bg-muted/30 rounded-lg px-3 py-3 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Résultat one-shot (saisie complète)
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <Input
                                value={rankInput}
                                onChange={(e) => setRankInput(e.target.value)}
                                placeholder="Rang (ex: 1)"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={timeInput}
                                onChange={(e) => setTimeInput(e.target.value)}
                                placeholder="Temps HH:MM:SS"
                                className="h-8 text-xs font-mono"
                              />
                              <Input
                                value={avgSpeedInput}
                                onChange={(e) =>
                                  setAvgSpeedInput(e.target.value)
                                }
                                placeholder="Vitesse moy. km/h"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={maxSpeedInput}
                                onChange={(e) =>
                                  setMaxSpeedInput(e.target.value)
                                }
                                placeholder="Vitesse max km/h"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={heartRateAvgInput}
                                onChange={(e) =>
                                  setHeartRateAvgInput(e.target.value)
                                }
                                placeholder="BPM moyen"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={heartRateMaxInput}
                                onChange={(e) =>
                                  setHeartRateMaxInput(e.target.value)
                                }
                                placeholder="BPM max"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={caloriesInput}
                                onChange={(e) =>
                                  setCaloriesInput(e.target.value)
                                }
                                placeholder="Calories"
                                className="h-8 text-xs"
                              />
                              <Input
                                type="datetime-local"
                                value={finishedAtInput}
                                onChange={(e) =>
                                  setFinishedAtInput(e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleSetResult(reg.id)}
                              >
                                Enregistrer
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                  setResultForm(null)
                                  setAvgSpeedInput('')
                                  setMaxSpeedInput('')
                                  setHeartRateAvgInput('')
                                  setHeartRateMaxInput('')
                                  setCaloriesInput('')
                                  setFinishedAtInput('')
                                }}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Inline loop form */}
                    {loopForm === reg.id && (
                      <tr key={`${reg.id}-loop`}>
                        <td colSpan={6} className="py-2 px-0">
                          <div className="bg-muted/30 rounded-lg px-3 py-3 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Boucle backyard (saisie complète)
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              <Input
                                value={loopTimeInput}
                                onChange={(e) =>
                                  setLoopTimeInput(e.target.value)
                                }
                                placeholder="Temps boucle H:MM:SS"
                                className="h-8 text-xs font-mono"
                              />
                              <Input
                                value={loopAvgSpeedInput}
                                onChange={(e) =>
                                  setLoopAvgSpeedInput(e.target.value)
                                }
                                placeholder="Vitesse moy. km/h"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={loopHeartRateAvgInput}
                                onChange={(e) =>
                                  setLoopHeartRateAvgInput(e.target.value)
                                }
                                placeholder="BPM moyen"
                                className="h-8 text-xs"
                              />
                              <Input
                                value={loopHeartRateMaxInput}
                                onChange={(e) =>
                                  setLoopHeartRateMaxInput(e.target.value)
                                }
                                placeholder="BPM max"
                                className="h-8 text-xs"
                              />
                              <Input
                                type="datetime-local"
                                value={loopStartedAtInput}
                                onChange={(e) =>
                                  setLoopStartedAtInput(e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                              <Input
                                type="datetime-local"
                                value={loopCompletedAtInput}
                                onChange={(e) =>
                                  setLoopCompletedAtInput(e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleAddLoop(reg.id)}
                              >
                                Ajouter
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                  setLoopForm(null)
                                  setLoopAvgSpeedInput('')
                                  setLoopHeartRateAvgInput('')
                                  setLoopHeartRateMaxInput('')
                                  setLoopStartedAtInput('')
                                  setLoopCompletedAtInput('')
                                }}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Backyard loops detail */}
                    {isBackyard && validatedLoops.length > 0 && (
                      <tr key={`${reg.id}-loops`} className="bg-muted/10">
                        <td colSpan={6} className="pb-2 pt-0 px-3">
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
                                {loop.avgSpeed
                                  ? ` · ${loop.avgSpeed.toFixed(1)} km/h`
                                  : ''}
                                {loop.heartRateAvg
                                  ? ` · ${loop.heartRateAvg} bpm`
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
      )}
    </>
  )
}
