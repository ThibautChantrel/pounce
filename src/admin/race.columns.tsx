'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useFormatter, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { RaceStatus, RaceFormat } from '@prisma/client'
import {
  adminValidateRaceAction,
  adminRejectRaceAction,
} from '@/actions/race/race.admin.actions'

export type RaceColumn = {
  id: string
  title: string
  status: RaceStatus
  format: RaceFormat
  organizerName: string
  trackTitle: string
  startAt: Date
  registrationCount: number
}

const STATUS_VARIANTS: Record<
  RaceStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  DRAFT: 'outline',
  PENDING_REVIEW: 'secondary',
  ACTIVE: 'default',
  IN_PROGRESS: 'default',
  CLOSED: 'outline',
  CANCELLED: 'destructive',
}

const RaceActions = ({ race }: { race: RaceColumn }) => {
  const t = useTranslations('Admin.Races')
  const router = useRouter()
  const [openValidate, setOpenValidate] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleValidate() {
    setLoading(true)
    const res = await adminValidateRaceAction(race.id)
    setLoading(false)
    if (res.success) {
      toast.success(t('validateSuccess'))
      router.refresh()
      setOpenValidate(false)
    } else {
      toast.error('Erreur')
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error(t('rejectReason') + ' requis')
      return
    }
    setLoading(true)
    const res = await adminRejectRaceAction(race.id, rejectReason)
    setLoading(false)
    if (res.success) {
      toast.success(t('rejectSuccess'))
      router.refresh()
      setOpenReject(false)
      setRejectReason('')
    } else {
      toast.error('Erreur')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/races/${race.id}`} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" /> Voir
            </Link>
          </DropdownMenuItem>
          {race.status === RaceStatus.PENDING_REVIEW && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setOpenValidate(true)}
                className="text-green-600 focus:text-green-600 cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> {t('validate')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenReject(true)}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <XCircle className="mr-2 h-4 w-4" /> {t('reject')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={openValidate}
        onOpenChange={setOpenValidate}
        onConfirm={handleValidate}
        isPending={loading}
        variant="update"
        title={t('validateTitle')}
        description={t('validateDesc')}
        actionLabel={t('validate')}
        cancelLabel="Annuler"
      />

      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('rejectDesc')}</p>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('rejectReason')}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenReject(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              {t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const useRaceColumns = () => {
  const t = useTranslations('Admin.Races')
  const format = useFormatter()

  return useMemo<ColumnDef<RaceColumn>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Titre',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-muted-foreground shrink-0" />
            <Link
              href={`/admin/races/${row.original.id}`}
              className="font-medium hover:underline hover:text-blue-600 truncate max-w-[200px]"
            >
              {row.getValue('title')}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell: ({ row }) => {
          const status = row.original.status
          const labels: Record<RaceStatus, string> = {
            DRAFT: 'Brouillon',
            PENDING_REVIEW: 'En attente',
            ACTIVE: 'Active',
            IN_PROGRESS: 'En cours',
            CLOSED: 'Terminée',
            CANCELLED: 'Annulée',
          }
          return (
            <Badge variant={STATUS_VARIANTS[status]}>{labels[status]}</Badge>
          )
        },
      },
      {
        accessorKey: 'format',
        header: t('format'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.format === RaceFormat.BACKYARD
              ? 'Backyard'
              : 'Course'}
          </span>
        ),
      },
      {
        accessorKey: 'organizerName',
        header: t('organizer'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.getValue('organizerName')}
          </span>
        ),
      },
      {
        accessorKey: 'trackTitle',
        header: t('track'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
            {row.getValue('trackTitle')}
          </span>
        ),
      },
      {
        accessorKey: 'startAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(undefined, e.shiftKey)}
          >
            {t('startAt')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {format.dateTime(new Date(row.getValue('startAt')), {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'registrationCount',
        header: t('participants'),
        cell: ({ row }) => (
          <span className="text-sm font-mono">
            {row.getValue('registrationCount')}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => <RaceActions race={row.original} />,
      },
    ],
    [t, format]
  )
}
