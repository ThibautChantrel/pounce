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
  Loader2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { removeFile } from '@/actions/file/file.actions'
import { useFormatter, useTranslations } from 'next-intl'

export type FileColumn = {
  id: string
  filename: string
  mimeType: string
  size: number
  createdAt: Date
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const FileActions = ({ file }: { file: FileColumn }) => {
  const t = useTranslations('Admin')
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await removeFile(file.id)
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('Actions.AlertDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('Actions.AlertDialog.description', { item: file.filename })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('Actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('Actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
            <span className="font-medium">{row.getValue('filename')}</span>
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
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
        header: t('Files.createdAt'),
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'))
          return (
            <span className="text-muted-foreground">
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
