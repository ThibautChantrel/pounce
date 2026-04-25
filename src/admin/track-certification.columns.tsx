'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Trash,
  ToggleLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useTranslations, useFormatter } from 'next-intl'
import { Link } from '@/navigation'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import {
  toggleTrackCertificationValid,
  deleteTrackCertification,
} from '@/actions/certification/certification.admin.actions'

export type TrackCertificationColumn = {
  id: string
  provider: string
  activityId: string
  activityType: string
  avgSpeed: number
  maxSpeed: number | null
  totalTime: number
  distance: number
  elevationGain: number
  heartRateAvg: number | null
  heartRateMax: number | null
  calories: number | null
  completedAt: Date
  isValid: boolean
  track: { id: string; title: string }
  user: {
    id: string
    email: string
    pseudo: string | null
    firstName: string | null
    lastName: string | null
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

const TrackCertActions = ({ cert }: { cert: TrackCertificationColumn }) => {
  const t = useTranslations('Admin.Certifications')
  const tAdmin = useTranslations('Admin')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    setIsPending(true)
    try {
      await toggleTrackCertificationValid(cert.id)
      toast.success(t('statusToggled'))
    } catch {
      toast.error(tAdmin('Actions.deleteError'))
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    setIsPending(true)
    try {
      await deleteTrackCertification(cert.id)
      toast.success(tAdmin('Actions.deleted'))
      setDeleteOpen(false)
    } catch {
      toast.error(tAdmin('Actions.deleteError'))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tAdmin('Actions.label')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tAdmin('Actions.label')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleToggle} disabled={isPending}>
            <ToggleLeft className="mr-2 h-4 w-4" />
            {cert.isValid ? t('invalidate') : t('validate')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            {tAdmin('Actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isPending={isPending}
        variant="delete"
        title={tAdmin('Actions.AlertDialog.title')}
        actionLabel={tAdmin('Actions.confirm')}
        cancelLabel={tAdmin('Actions.cancel')}
        description={tAdmin('Actions.AlertDialog.description', {
          item: cert.track.title,
        })}
      />
    </>
  )
}

export const useTrackCertificationColumns = () => {
  const t = useTranslations('Admin.Certifications')
  const format = useFormatter()

  return useMemo<ColumnDef<TrackCertificationColumn>[]>(
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
        accessorKey: 'track',
        header: t('track'),
        cell: ({ row }) => (
          <Link
            href={`/admin/tracks/${row.original.track.id}`}
            className="font-medium hover:underline hover:text-blue-600 text-sm"
          >
            {row.original.track.title}
          </Link>
        ),
      },
      {
        accessorKey: 'activityType',
        header: t('activityType'),
        cell: ({ row }) => (
          <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">
            {row.original.activityType}
          </span>
        ),
      },
      {
        accessorKey: 'completedAt',
        header: t('completedAt'),
        cell: ({ row }) =>
          format.dateTime(new Date(row.original.completedAt), {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
      },
      {
        accessorKey: 'totalTime',
        header: t('duration'),
        cell: ({ row }) => formatDuration(row.original.totalTime),
      },
      {
        accessorKey: 'avgSpeed',
        header: t('avgSpeed'),
        cell: ({ row }) => `${row.original.avgSpeed.toFixed(1)} km/h`,
      },
      {
        accessorKey: 'isValid',
        header: t('status'),
        cell: ({ row }) =>
          row.original.isValid ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          ),
      },
      {
        id: 'actions',
        cell: ({ row }) => <TrackCertActions cert={row.original} />,
      },
    ],
    [t, format]
  )
}
