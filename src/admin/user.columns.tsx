'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash,
  Pencil,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { removeUser } from '@/actions/user/user.admin.actions'
import { useTranslations } from 'next-intl'

export type UserColumn = {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: Date
}

const UserActions = ({ user }: { user: UserColumn }) => {
  const t = useTranslations('Admin')
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await removeUser(user.id)
      toast.success(t('Actions.deleted'))
      setOpen(false)
    } catch {
      toast.error(t('Actions.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* MENU DÉROULANT */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('Actions.label')}</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => console.log('Edit', user.id)}>
            <Pencil className="mr-2 h-4 w-4" /> {t('Actions.edit')}
          </DropdownMenuItem>

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
              {t('Actions.AlertDialog.description', {
                item: user.name || user.email || 'User',
              })}
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

export const useUserColumns = () => {
  const t = useTranslations('Admin')

  return useMemo<ColumnDef<UserColumn>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('Users.name'),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('Users.email')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'role',
        header: t('Users.role'),
        cell: ({ row }) => (
          <span className="font-bold">{row.getValue('role')}</span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => <UserActions user={row.original} />,
      },
    ],
    [t]
  )
}
