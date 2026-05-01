'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations, useFormatter } from 'next-intl'
import { Link } from '@/navigation'
import { Badge } from '@/components/ui/badge'
import { SyncDetails } from '@/server/modules/strava/sync-log.types'

export type StravaSyncColumn = {
  id: string
  source: string
  syncedAt: Date
  details: unknown
  user: {
    id: string
    email: string
    pseudo: string | null
    firstName: string | null
    lastName: string | null
  }
}

export const useStravaSyncColumns = () => {
  const t = useTranslations('Admin.StravaSyncs')
  const format = useFormatter()

  return useMemo<ColumnDef<StravaSyncColumn>[]>(
    () => [
      {
        accessorKey: 'user',
        header: t('user'),
        cell: ({ row }) => {
          const u = row.original.user
          return (
            <Link
              href={`/admin/users/${u.id}`}
              className="font-medium hover:underline hover:text-blue-600 text-sm"
            >
              {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}
            </Link>
          )
        },
      },
      {
        accessorKey: 'syncedAt',
        header: t('syncedAt'),
        cell: ({ row }) =>
          format.dateTime(new Date(row.original.syncedAt), {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
      {
        accessorKey: 'source',
        header: t('source'),
        cell: ({ row }) => (
          <Badge
            variant={row.original.source === 'manual' ? 'outline' : 'secondary'}
          >
            {row.original.source === 'manual'
              ? t('sourceManual')
              : t('sourceWebhook')}
          </Badge>
        ),
      },
      {
        id: 'processed',
        header: t('processed'),
        cell: ({ row }) => {
          const d = row.original.details as SyncDetails
          return (
            <span className="tabular-nums">{d?.activitiesProcessed ?? 0}</span>
          )
        },
      },
      {
        id: 'matched',
        header: t('matched'),
        cell: ({ row }) => {
          const d = row.original.details as SyncDetails
          const matched = d?.activitiesMatched ?? 0
          return (
            <span
              className={
                matched > 0
                  ? 'text-green-600 font-medium tabular-nums'
                  : 'tabular-nums'
              }
            >
              {matched}
            </span>
          )
        },
      },
      {
        id: 'detail',
        cell: ({ row }) => (
          <Link
            href={`/admin/strava-syncs/${row.original.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('viewDetail')}
          </Link>
        ),
      },
    ],
    [t, format]
  )
}
