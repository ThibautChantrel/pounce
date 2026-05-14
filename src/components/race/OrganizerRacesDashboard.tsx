'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/navigation'
import { Pencil, Trash2, Users, Eye } from 'lucide-react'
import { RaceStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { deleteRaceAction } from '@/actions/race/race.actions'
import type { RaceSummary } from '@/actions/race/race.types'

const PENDING_STATUS_LABEL: Record<RaceStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_REVIEW: 'En attente de validation admin',
  ACTIVE: 'Active',
  IN_PROGRESS: 'En cours',
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
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {race.registrationCount}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
