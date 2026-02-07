'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash,
  Download,
  Copy,
  FileText,
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
import { removeFile } from '@/actions/file/file.admin.actions'
import { useFormatter, useTranslations } from 'next-intl'
import { formatBytes } from '@/utils/files'
import { Link, useRouter } from '@/navigation'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'

export type FileColumn = {
  id: string
  filename: string
  mimeType: string
  size: number
  createdAt: Date
}

const FileActions = ({ file }: { file: FileColumn }) => {
  const t = useTranslations('Admin')
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await removeFile(file.id)
      router.refresh()
      toast.success(t('Actions.deleted'))
      setOpen(false)
    } catch {
      toast.error(t('Actions.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/api/files/${file.id}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copié !')
  }

  const handleDownload = () => {
    window.open(`/api/files/${file.id}`, '_blank')
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

          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> {t('Actions.download')}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyUrl}>
            <Copy className="mr-2 h-4 w-4" /> {t('Actions.copyLink')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <Trash className="mr-2 h-4 w-4" /> {t('Actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        isPending={isDeleting}
        variant="delete"
        title={t('Actions.AlertDialog.title')}
        actionLabel={t('Actions.confirm')}
        cancelLabel={t('Actions.cancel')}
        description={t('Actions.AlertDialog.description', {
          item: file.filename,
        })}
      />
    </>
  )
}

export const useFileColumns = () => {
  const t = useTranslations('Admin')
  const format = useFormatter()

  return useMemo<ColumnDef<FileColumn>[]>(
    () => [
      {
        accessorKey: 'filename',
        header: t('Files.filename'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/admin/files/${row.original.id}`}
              className="font-medium hover:underline hover:text-blue-600"
            >
              {row.getValue('filename')}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'mimeType',
        header: t('Files.type'),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.getValue('mimeType')}
          </span>
        ),
      },
      {
        accessorKey: 'size',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(undefined, e.shiftKey)}
          >
            {t('Files.size')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const size = parseInt(row.getValue('size'))
          return <span className="font-mono text-sm">{formatBytes(size)}</span>
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(undefined, e.shiftKey)}
          >
            {t('Files.createdAt')}
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
        cell: ({ row }) => <FileActions file={row.original} />,
      },
    ],
    [t, format]
  )
}
