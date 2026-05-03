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
} from 'lucide-react'
import { RaceAccessType, RaceFormat, RegistrationStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
}: Props) {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)

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

  const bannerUrl = race.bannerId ? `/api/files/${race.bannerId}` : null
  const logoUrl = race.logoId ? `/api/files/${race.logoId}` : null

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Courses
      </Link>

      {/* Banner */}
      {bannerUrl && (
        <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden">
          <Image
            src={bannerUrl}
            alt={race.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
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

          {/* Classement (si terminé) */}
          {race.status === 'CLOSED' &&
            race.registrations.filter((r) => r.rank).length > 0 && (
              <div className="rounded-2xl border border-border p-5">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Classement
                </h2>
                <div className="space-y-2">
                  {race.registrations
                    .filter((r) => r.rank && r.totalTimeSeconds)
                    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
                    .slice(0, 10)
                    .map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-6 text-center font-bold text-muted-foreground text-xs">
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
            )}
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
              {(
                [
                  RegistrationStatus.PENDING,
                  RegistrationStatus.REGISTERED,
                ] as RegistrationStatus[]
              ).includes(myRegistration.status) &&
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

          {/* Inscription */}
          {!myRegistration && isActive && (
            <div className="rounded-2xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold">S&apos;inscrire</h3>
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
                    disabled={loading}
                  >
                    {loading
                      ? 'En cours...'
                      : race.accessType === RaceAccessType.PUBLIC_VALIDATION
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
            </div>
          )}
        </div>
      </div>
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
