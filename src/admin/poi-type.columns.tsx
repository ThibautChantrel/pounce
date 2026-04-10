'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash,
  Pencil,
  MapPinned,
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
import { deletePoiTypeAction } from '@/actions/poi-type/poi-type.admin.action'

export type PoiTypeColumn = {
  id: string
  value: string
  description?: string | null
  createdAt: Date
}

const PoiTypeActions = ({ poiType }: { poiType: PoiTypeColumn }) => {
  const t = useTranslations('Admin')
  const [openDelete, setOpenDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deletePoiTypeAction(poiType.id)
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

          <DropdownMenuItem asChild>
            <Link
              href={`/admin/poi-types/${poiType.id}/edit`}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" /> {t('Actions.edit')}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

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
          item: poiType.value,
          bold: (chunks) => <strong>{chunks}</strong>,
        })}
      />
    </>
  )
}

export const usePoiTypeColumns = () => {
  const t = useTranslations('Admin.PoiTypes')
  const tGlobal = useTranslations('Admin.Global')
  const format = useFormatter()

  return useMemo<ColumnDef<PoiTypeColumn>[]>(
    () => [
      {
        accessorKey: 'value',
        header: t('value'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/admin/poi-types/${row.original.id}`}
              className="font-medium hover:underline hover:text-blue-600"
            >
              {row.getValue('value')}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: tGlobal('description'),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm truncate max-w-xs block">
            {row.original.description || '-'}
          </span>
        ),
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
        cell: ({ row }) => <PoiTypeActions poiType={row.original} />,
      },
    ],
    [t, tGlobal, format]
  )
}
