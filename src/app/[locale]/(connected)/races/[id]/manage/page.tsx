import { auth } from '@/server/modules/auth/auth.config'
import { notFound } from 'next/navigation'
import { getRaceAction } from '@/actions/race/race.actions'
import { RaceForm } from '@/components/race/RaceForm'
import { RaceParticipantsTable } from '@/components/race/RaceParticipantsTable'
import { ManualRaceSyncButton } from '@/components/race/ManualRaceSyncButton'
import { Link } from '@/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Activity,
} from 'lucide-react'
import { RaceStatus } from '@prisma/client'

type PageProps = { params: Promise<{ id: string }> }

const STATUS_LABELS: Record<RaceStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_REVIEW: 'En attente',
  ACTIVE: 'Active',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Clôturée',
  CANCELLED: 'Annulée',
}

const STATUS_STYLES: Record<RaceStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_REVIEW:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ACTIVE:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  IN_PROGRESS:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-xl font-bold text-foreground leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  )
}

export default async function ManageRacePage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) notFound()

  const race = await getRaceAction(id)
  if (!race) notFound()

  const isOwner = race.organizer.id === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isOwner && !isAdmin) notFound()

  const regs = race.registrations
  const total = race.registrationCount
  const pending = regs.filter((r) => r.status === 'PENDING').length
  const registered = regs.filter((r) => r.status === 'REGISTERED').length
  const validated = regs.filter((r) => r.status === 'VALIDATED').length
  const dnf = regs.filter((r) => r.status === 'DNF').length
  const dns = regs.filter((r) => r.status === 'DNS').length
  const dq = regs.filter((r) => r.status === 'DISQUALIFIED').length
  const isActive = race.status === RaceStatus.ACTIVE

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-20">
      {/* Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3 flex-wrap">
          <Link
            href="/profile/races"
            className="hover:text-foreground transition-colors"
          >
            Mes courses
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link
            href={`/races/${id}`}
            className="hover:text-foreground transition-colors truncate max-w-[200px]"
          >
            {race.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span>Administration</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground flex-1 min-w-0 truncate">
            {race.title}
          </h1>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto shrink-0 ${STATUS_STYLES[race.status]}`}
          >
            {STATUS_LABELS[race.status]}
          </span>
        </div>

        <Link
          href={`/races/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voir la page publique
        </Link>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Total"
          value={total}
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="En attente"
          value={pending + registered}
          sub={pending > 0 ? `${pending} à valider` : undefined}
        />
        <StatCard
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Validés"
          value={validated}
        />
        <StatCard
          icon={<XCircle className="w-4 h-4" />}
          label="DNF / DNS / DQ"
          value={dnf + dns + dq}
          sub={
            [dnf && `${dnf} DNF`, dns && `${dns} DNS`, dq && `${dq} DQ`]
              .filter(Boolean)
              .join(' · ') || undefined
          }
        />
      </div>

      {/* Participants */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-muted/40 border-b border-border gap-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Participants
            <span className="text-muted-foreground font-normal">({total})</span>
          </h2>
          <div className="flex items-center gap-2">
            {isActive && <ManualRaceSyncButton raceId={id} />}
          </div>
        </div>

        {regs.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 text-muted-foreground/50" />
            <p>Aucun participant pour le moment.</p>
            {isActive && (
              <p className="text-xs">
                Les participants apparaîtront ici une fois inscrits ou
                synchronisés via Strava.
              </p>
            )}
          </div>
        ) : (
          <div className="p-5">
            <RaceParticipantsTable
              raceId={id}
              raceFormat={race.format}
              registrations={race.registrations}
              isOrganizer={true}
            />
          </div>
        )}
      </div>

      {/* Edit section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Modifier la course
          </h2>
        </div>
        <RaceForm defaultValues={race} />
      </div>

      {/* Informative notices */}
      {(race.status === RaceStatus.DRAFT ||
        race.status === RaceStatus.ACTIVE ||
        race.status === RaceStatus.IN_PROGRESS) && (
        <div className="rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            Informations
          </h2>
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            {race.status === RaceStatus.DRAFT && (
              <li>
                • Cette course est en <strong>brouillon</strong> — elle
                n&apos;est pas visible publiquement. Publie-la pour ouvrir les
                inscriptions.
              </li>
            )}
            {race.status === RaceStatus.ACTIVE && (
              <li>
                • La course est <strong>active</strong> — les inscriptions sont
                ouvertes. La synchro Strava démarrera automatiquement au début
                de la course.
              </li>
            )}
            {race.status === RaceStatus.IN_PROGRESS && (
              <li>
                • La course est <strong>en cours</strong>. Les synchronisations
                Strava s&apos;effectuent automatiquement toutes les heures.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
