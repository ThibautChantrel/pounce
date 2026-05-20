'use client'

import { useState } from 'react'
import type { RaceSummary } from '@/actions/race/race.types'
import { RaceFormat, RaceStatus } from '@prisma/client'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Settings, Plus, Flag } from 'lucide-react'

const FORMAT_LABELS: Record<RaceFormat, string> = {
  ONE_SHOT: 'Classique',
  BACKYARD: 'Backyard',
}

const STATUS_LABELS: Record<RaceStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_REVIEW: 'En attente',
  ACTIVE: 'Active',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Terminée',
  CANCELLED: 'Annulée',
}

const STATUS_COLORS: Record<RaceStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_REVIEW:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACTIVE:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  IN_PROGRESS:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

type Props = {
  races: RaceSummary[]
}

export function RaceManagementTable({ races }: Props) {
  const [formatFilter, setFormatFilter] = useState<RaceFormat | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<RaceStatus | 'ALL'>('ALL')

  const filtered = races.filter((r) => {
    if (formatFilter !== 'ALL' && r.format !== formatFilter) return false
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
    return true
  })

  if (races.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Flag className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Aucune course organisée
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Créez votre première course pour commencer
          </p>
        </div>
        <Link href="/races/create">
          <Button size="sm" className="rounded-full">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Créer une course
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(['ALL', RaceFormat.ONE_SHOT, RaceFormat.BACKYARD] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  formatFilter === f
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'ALL' ? 'Tous formats' : FORMAT_LABELS[f]}
              </button>
            )
          )}
        </div>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(
            [
              'ALL',
              RaceStatus.DRAFT,
              RaceStatus.PENDING_REVIEW,
              RaceStatus.ACTIVE,
              RaceStatus.IN_PROGRESS,
              RaceStatus.CLOSED,
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'Tous statuts' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Aucune course pour ces filtres
        </p>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                    Format
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">
                    Inscrits
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((race) => (
                  <tr
                    key={race.id}
                    className="bg-card hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-[180px]">
                        {race.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                        {race.track.title}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {FORMAT_LABELS[race.format]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[race.status]}`}
                      >
                        {STATUS_LABELS[race.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(race.startAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-xs font-medium tabular-nums">
                        {race.registrationCount}
                        {race.maxParticipants
                          ? ` / ${race.maxParticipants}`
                          : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/races/${race.id}/manage`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 px-3"
                        >
                          <Settings className="w-3.5 h-3.5 mr-1.5" />
                          Gérer
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Link href="/races/create">
          <Button size="sm" variant="outline" className="rounded-full">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Créer une course
          </Button>
        </Link>
      </div>
    </div>
  )
}
