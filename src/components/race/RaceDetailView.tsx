'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/navigation'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Lock,
  RefreshCw,
  Zap,
  ArrowLeft,
  Trophy,
  Navigation,
  Mountain,
  Settings,
  MailCheck,
  Activity,
  Globe,
} from 'lucide-react'
import { RaceAccessType, RaceFormat, RegistrationStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TrackGpxMap } from '@/components/track/TrackGpxMap'
import { RaceLeaderboardChart } from './RaceLeaderboardChart'
import { RaceParticipantsTable } from './RaceParticipantsTable'
import { RaceStatsSection } from './stats/RaceStatsSection'
import {
  registerForRaceAction,
  cancelRegistrationAction,
} from '@/actions/race/registration.actions'
import type { RaceDetail } from '@/actions/race/race.types'

type MyRegistration = {
  id: string
  status: RegistrationStatus
  registeredAt: Date
  totalTimeSeconds: number | null
  rank: number | null
} | null

type Props = {
  race: RaceDetail
  myRegistration: MyRegistration
  isAuthenticated: boolean
  isOrganizer?: boolean
  isVerified?: boolean
  hasStravaSync?: boolean
  hasBanner?: boolean
}

const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: 'En attente de validation',
  REGISTERED: 'Inscrit',
  VALIDATED: 'Validé',
  DNF: 'Abandon (DNF)',
  DNS: 'Non-partant (DNS)',
  DISQUALIFIED: 'Disqualifié',
}

const REGISTRATION_STATUS_STYLES: Record<RegistrationStatus, string> = {
  PENDING:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  REGISTERED:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  VALIDATED:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  DNF: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  DNS: 'bg-muted text-muted-foreground',
  DISQUALIFIED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}h${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`
}

export function RaceDetailView({
  race,
  myRegistration,
  isAuthenticated,
  isOrganizer = false,
  isVerified = false,
  hasStravaSync = false,
  hasBanner = false,
}: Props) {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)

  const isOpenRace =
    race.format === RaceFormat.ONE_SHOT &&
    race.accessType === RaceAccessType.PUBLIC_FREE

  const isFull =
    race.maxParticipants !== null &&
    race.registrationCount >= race.maxParticipants
  const canRegister = !myRegistration && !isFull
  const isActive = race.status === 'ACTIVE'

  async function handleRegister() {
    if (!isAuthenticated) {
      toast.error("Connecte-toi pour t'inscrire")
      return
    }
    setLoading(true)
    const res = await registerForRaceAction(race.id, accessCode || undefined)
    setLoading(false)
    if (res.success) {
      toast.success(
        race.accessType === RaceAccessType.PUBLIC_VALIDATION
          ? 'Demande envoyée, en attente de validation'
          : 'Inscription confirmée !'
      )
    } else {
      const msgs: Record<string, string> = {
        invalid_access_code: "Code d'accès incorrect",
        race_full: 'La course est complète',
        already_registered: 'Déjà inscrit',
        race_not_active: 'Les inscriptions ne sont pas ouvertes',
      }
      toast.error(msgs[res.error ?? ''] ?? "Erreur lors de l'inscription")
    }
  }

  async function handleCancel() {
    setLoading(true)
    const res = await cancelRegistrationAction(race.id)
    setLoading(false)
    if (res.success) toast.success('Inscription annulée')
    else toast.error("Impossible d'annuler")
  }

  const logoUrl = race.logoId ? `/api/files/${race.logoId}` : null

  return (
    <div className="space-y-8">
      {/* Back + admin */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Courses
        </Link>
        {isOrganizer && (
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href={`/races/${race.id}/manage`}>
              <Settings className="w-3.5 h-3.5" />
              Gérer
            </Link>
          </Button>
        )}
      </div>

      {/* Header — remonté si bannière au-dessus */}
      <div className={`flex items-start gap-4 ${hasBanner ? '-mt-2' : ''}`}>
        {logoUrl && (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0">
            <Image src={logoUrl} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {race.format === RaceFormat.BACKYARD ? (
                <>
                  <RefreshCw className="w-3 h-3" /> Backyard
                </>
              ) : isOpenRace ? (
                <>
                  <Globe className="w-3 h-3" /> Compétition ouverte
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" /> Course
                </>
              )}
            </span>
            {race.accessType === RaceAccessType.PRIVATE && (
              <span className="flex items-center gap-1 bg-muted text-muted-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" /> Privée
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{race.title}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {race.track.title} — {race.track.distance.toFixed(1)} km ·{' '}
            {race.track.elevationGain}m D+
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parcours */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <TrackGpxMap
              customUrl={
                race.track.gpxFileId
                  ? `/api/files/${race.track.gpxFileId}`
                  : undefined
              }
              className="h-64 w-full"
            />
            <div className="p-4">
              <p className="font-semibold text-foreground">
                {race.track.title}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5"
                >
                  <Navigation className="w-3 h-3" />
                  {race.track.distance.toFixed(1)} km
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5"
                >
                  <Mountain className="w-3 h-3" />
                  {race.track.elevationGain}m D+
                </Badge>
              </div>
            </div>
          </div>

          {race.description && (
            <div className="rounded-2xl border border-border p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                À propos
              </h2>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {race.description}
              </p>
            </div>
          )}

          {/* Classement */}
          {race.registrations.filter((r) => r.rank).length > 0 &&
            (() => {
              const ranked = race.registrations
                .filter((r) => r.rank && r.totalTimeSeconds)
                .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))

              const chartData = ranked.map((r) => ({
                name:
                  `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim() ||
                  r.user.pseudo ||
                  'Participant',
                seconds: r.totalTimeSeconds ?? 0,
                rank: r.rank ?? 0,
              }))

              return (
                <div className="rounded-2xl border border-border p-5">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Classement
                  </h2>
                  <div className="mb-5">
                    <RaceLeaderboardChart registrations={chartData} />
                  </div>
                  <div className="space-y-2 border-t border-border pt-4">
                    {ranked.slice(0, 10).map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={`w-6 text-center font-bold text-xs ${
                            reg.rank === 1
                              ? 'text-amber-500'
                              : reg.rank === 2
                                ? 'text-slate-400'
                                : reg.rank === 3
                                  ? 'text-amber-700'
                                  : 'text-muted-foreground'
                          }`}
                        >
                          #{reg.rank}
                        </span>
                        <span className="flex-1 font-medium">
                          {reg.user.firstName ?? ''} {reg.user.lastName ?? ''}{' '}
                          {reg.user.pseudo ? `(${reg.user.pseudo})` : ''}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {reg.totalTimeSeconds
                            ? formatTime(reg.totalTimeSeconds)
                            : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Infos clés */}
          <div className="rounded-2xl border border-border p-5 space-y-3">
            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Début"
              value={new Date(race.startAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="Fin"
              value={new Date(race.endAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            {race.format === RaceFormat.BACKYARD &&
              race.loopDurationMinutes && (
                <InfoRow
                  icon={<RefreshCw className="w-4 h-4" />}
                  label="Boucle toutes les"
                  value={
                    race.loopDurationMinutes >= 60
                      ? `${race.loopDurationMinutes / 60}h`
                      : `${race.loopDurationMinutes}min`
                  }
                />
              )}
            <InfoRow
              icon={<Users className="w-4 h-4" />}
              label="Participants"
              value={`${race.registrationCount}${race.maxParticipants ? ` / ${race.maxParticipants}` : ''}`}
            />
          </div>

          {/* Mon statut */}
          {myRegistration && (
            <div className="rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold">Mon inscription</h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${REGISTRATION_STATUS_STYLES[myRegistration.status]}`}
              >
                {REGISTRATION_STATUS_LABELS[myRegistration.status]}
              </span>
              {myRegistration.rank && (
                <p className="text-sm text-muted-foreground">
                  Classement : #{myRegistration.rank}
                  {myRegistration.totalTimeSeconds
                    ? ` — ${formatTime(myRegistration.totalTimeSeconds)}`
                    : ''}
                </p>
              )}
              {(['PENDING', 'REGISTERED'] as RegistrationStatus[]).includes(
                myRegistration.status
              ) &&
                isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full"
                  >
                    Annuler l&apos;inscription
                  </Button>
                )}
            </div>
          )}

          {/* Sidebar inscription */}
          {isActive && !myRegistration && (
            <div className="rounded-2xl border border-border p-5 space-y-3">
              {/* Compétition ouverte */}
              {isOpenRace ? (
                <>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-primary" /> Compétition
                    ouverte
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pas d&apos;inscription requise. Cours ce parcours et
                    synchronise ton activité Strava — tu apparaîtras
                    automatiquement au classement.
                  </p>
                  {isAuthenticated && !hasStravaSync && (
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2.5 text-xs text-orange-700 dark:text-orange-400 hover:bg-orange-100 transition-colors"
                    >
                      <Activity className="w-4 h-4 shrink-0" />
                      Connecte Strava sur ton profil pour être inclus au
                      classement
                    </Link>
                  )}
                  {!isAuthenticated && (
                    <p className="text-xs text-muted-foreground">
                      <Link href="/login" className="underline">
                        Connecte-toi
                      </Link>{' '}
                      et lie Strava pour apparaître au classement.
                    </p>
                  )}
                </>
              ) : (
                /* Courses avec inscription */
                <>
                  <h3 className="text-sm font-semibold">S&apos;inscrire</h3>

                  {/* Gate : email non vérifié */}
                  {isAuthenticated && !isVerified && (
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2.5 text-xs text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 transition-colors"
                    >
                      <MailCheck className="w-4 h-4 shrink-0" />
                      Valide ton adresse email sur ton profil pour
                      t&apos;inscrire
                    </Link>
                  )}

                  {/* Gate : Strava non connecté */}
                  {isAuthenticated && isVerified && !hasStravaSync && (
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2.5 text-xs text-orange-700 dark:text-orange-400 hover:bg-orange-100 transition-colors"
                    >
                      <Activity className="w-4 h-4 shrink-0" />
                      Connecte Strava sur ton profil pour t&apos;inscrire
                    </Link>
                  )}

                  {/* Formulaire d'inscription */}
                  {(!isAuthenticated || (isVerified && hasStravaSync)) && (
                    <>
                      {isFull && (
                        <p className="text-sm text-muted-foreground">
                          La course est complète.
                        </p>
                      )}
                      {canRegister && (
                        <>
                          {race.accessType === RaceAccessType.PRIVATE && (
                            <Input
                              placeholder="Code d'accès"
                              value={accessCode}
                              onChange={(e) => setAccessCode(e.target.value)}
                            />
                          )}
                          <Button
                            className="w-full"
                            onClick={handleRegister}
                            disabled={loading || !isAuthenticated}
                          >
                            {loading
                              ? 'En cours...'
                              : race.accessType ===
                                  RaceAccessType.PUBLIC_VALIDATION
                                ? "Demander à s'inscrire"
                                : "S'inscrire"}
                          </Button>
                          {!isAuthenticated && (
                            <p className="text-xs text-muted-foreground text-center">
                              <Link href="/login" className="underline">
                                Connecte-toi
                              </Link>{' '}
                              pour t&apos;inscrire
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats & graphiques */}
      {race.registrations.length > 0 && (
        <div className="rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
            <Trophy className="w-4 h-4" /> Statistiques
          </h2>
          <RaceStatsSection race={race} />
        </div>
      )}

      {/* Participants */}
      {race.registrations.length > 0 && (
        <div className="rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({race.registrationCount})
            </h2>
          </div>
          <RaceParticipantsTable
            raceId={race.id}
            raceFormat={race.format}
            registrations={race.registrations}
          />
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
          {label}
        </p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  )
}
