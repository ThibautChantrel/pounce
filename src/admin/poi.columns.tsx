'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash,
  MapPin,
  Pencil,
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
import { PoiType } from '@prisma/client'
import { deletePoiAction } from '@/actions/poi/poi.admin.actions'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { Badge } from '@/components/ui/badge'
import { PoiTypeVariants } from '@/utils/pois'

export type PoiColumn = {
  id: string
  name: string
  description?: string | null
  type: PoiType
  latitude: number
  longitude: number
  createdAt: Date
}

const PoiActions = ({ poi }: { poi: PoiColumn }) => {
  const t = useTranslations('Admin')
  const [openDelete, setOpenDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deletePoiAction(poi.id)

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
          {/* Note: Ajuste l'URL selon ta structure de route */}
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/pois/${poi.id}/edit`}
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
          item: poi.name,
          bold: (chunks) => <strong>{chunks}</strong>,
        })}
      />
    </>
  )
}

export const usePoiColumns = () => {
  const t = useTranslations('Admin.Pois')
  const format = useFormatter()

  return useMemo<ColumnDef<PoiColumn>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/admin/pois/${row.original.id}`}
              className="font-medium hover:underline hover:text-blue-600"
            >
              {row.getValue('name')}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: t('type'),
        cell: ({ row }) => {
          const type = row.original.type

          return <Badge variant={PoiTypeVariants[type]}>{type}</Badge>
        },
      },
      {
        id: 'coordinates',
        header: t('coordinates'),
        cell: ({ row }) => {
          const lat = row.original.latitude.toFixed(4)
          const lng = row.original.longitude.toFixed(4)
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {lat}, {lng}
            </span>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('createdAt')}
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
        cell: ({ row }) => <PoiActions poi={row.original} />,
      },
    ],
    [t, format]
  )
}
