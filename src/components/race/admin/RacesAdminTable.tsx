'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Eye, Clock, Zap, RefreshCw } from 'lucide-react'
import { RaceStatus, RaceFormat } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/navigation'
import {
  adminValidateRaceAction,
  adminRejectRaceAction,
} from '@/actions/race/race.admin.actions'
import type { RaceSummary } from '@/actions/race/race.types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<RaceStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_REVIEW:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACTIVE:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_LABELS: Record<RaceStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_REVIEW: 'En attente',
  ACTIVE: 'Active',
  CLOSED: 'Terminée',
  CANCELLED: 'Annulée',
}

type Props = { data: RaceSummary[]; totalItems: number }

export function RacesAdminTable({ data }: Props) {
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  async function handleValidate(id: string) {
    setLoading(id)
    const res = await adminValidateRaceAction(id)
    setLoading(null)
    if (res.success) toast.success('Course validée')
    else toast.error('Erreur lors de la validation')
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      toast.error('Motif requis')
      return
    }
    setLoading(id)
    const res = await adminRejectRaceAction(id, rejectReason)
    setLoading(null)
    if (res.success) {
      toast.success('Course refusée')
      setRejectTarget(null)
      setRejectReason('')
    } else {
      toast.error('Erreur lors du refus')
    }
  }

  return (
    <div className="space-y-3">
      {data.length === 0 && (
        <p className="text-muted-foreground text-sm py-8 text-center">
          Aucune course trouvée
        </p>
      )}
      {data.map((race) => (
        <div
          key={race.id}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    STATUS_STYLES[race.status]
                  )}
                >
                  {STATUS_LABELS[race.status]}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {race.format === RaceFormat.BACKYARD ? (
                    <RefreshCw className="w-3 h-3" />
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                  {race.format === RaceFormat.BACKYARD ? 'Backyard' : 'Course'}
                </span>
              </div>
              <h3 className="font-semibold text-sm mt-1 truncate">
                {race.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Parcours : {race.track.title} · {race.track.distance.toFixed(1)}{' '}
                km
              </p>
              <p className="text-xs text-muted-foreground">
                Organisateur : {race.organizer.firstName ?? ''}{' '}
                {race.organizer.lastName ?? ''} (
                {race.organizer.pseudo ?? 'sans pseudo'})
              </p>
              <p className="text-xs text-muted-foreground">
                Du {new Date(race.startAt).toLocaleDateString('fr-FR')} au{' '}
                {new Date(race.endAt).toLocaleDateString('fr-FR')}
              </p>
              {race.adminRejectionReason && (
                <p className="text-xs text-red-500 mt-1">
                  Refus : {race.adminRejectionReason}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/admin/races/${race.id}`}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>

              {race.status === RaceStatus.PENDING_REVIEW && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleValidate(race.id)}
                    disabled={loading === race.id}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() =>
                      setRejectTarget(rejectTarget === race.id ? null : race.id)
                    }
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </>
              )}
              {race.status === RaceStatus.ACTIVE && (
                <Clock className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>

          {rejectTarget === race.id && (
            <div className="flex gap-2 pt-1">
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motif du refus..."
                className="flex-1 h-8 text-sm"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(race.id)}
                disabled={loading === race.id}
              >
                Refuser
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRejectTarget(null)
                  setRejectReason('')
                }}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
