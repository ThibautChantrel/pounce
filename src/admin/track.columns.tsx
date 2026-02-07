'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash,
  Pencil,
  Route, // Icône plus adaptée pour un parcours que MapPin
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
import { toast } from 'sonner'
import { useFormatter, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { Badge } from '@/components/ui/badge'
import { deleteTrackAction } from '@/actions/track/track.admin.action'

// Type aplati pour l'affichage dans le tableau
export type TrackColumn = {
  id: string
  title: string
  description?: string | null
  distance: number
  visible: boolean
  createdAt: Date
}

const TrackActions = ({ track }: { track: TrackColumn }) => {
  const t = useTranslations('Admin')
  const [openDelete, setOpenDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteTrackAction(track.id)

      if (res.success) {
        toast.success(t('Actions.deleted'))
        router.refresh()
        setOpenDelete(false)
      } else {
        toast.error(res.error || t('Actions.deleteError'))
      }
    } catch {
      toast.error(t('Actions.deleteError'))
    } finally {
      setIsDeleting(false)
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
          <DropdownMenuLabel>{t('Actions.label')}</DropdownMenuLabel>

          {/* Action Éditer */}
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/tracks/${track.id}/edit`}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" /> {t('Actions.edit')}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Action Supprimer */}
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <Trash className="mr-2 h-4 w-4" /> {t('Actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={handleDelete}
        isPending={isDeleting}
        variant="delete"
        title={t('Actions.AlertDialog.title')}
        actionLabel={t('Actions.confirm')}
        cancelLabel={t('Actions.cancel')}
        description={t.rich('Actions.AlertDialog.description', {
          item: track.title,
          bold: (chunks) => <strong>{chunks}</strong>,
        })}
      />
    </>
  )
}

export const useTrackColumns = () => {
  const t = useTranslations('Admin.Tracks')
  const tGlobal = useTranslations('Admin.Global') // Pour les trucs génériques comme "Visible"
  const format = useFormatter()

  return useMemo<ColumnDef<TrackColumn>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('title'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/admin/tracks/${row.original.id}`}
              className="font-medium hover:underline hover:text-blue-600"
            >
              {row.getValue('title')}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'distance',
        header: t('distance'),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.distance} km</span>
        ),
      },
      {
        accessorKey: 'visible',
        header: t('visible'),
        cell: ({ row }) => {
          const isVisible = row.original.visible
          return (
            <Badge
              variant={isVisible ? 'default' : 'secondary'}
              className={!isVisible ? 'text-muted-foreground' : ''}
            >
              {isVisible ? tGlobal('visible') : tGlobal('hidden')}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(undefined, e.shiftKey)}
          >
            {tGlobal('createdAt')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'))
          return (
            <span className="text-muted-foreground text-sm">
              {format.dateTime(date, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <TrackActions track={row.original} />,
      },
    ],
    [t, tGlobal, format]
  )
}
