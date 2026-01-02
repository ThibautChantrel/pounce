'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown, Trash, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { removeUser } from '@/actions/user/user.actions'
import { useTranslations } from 'next-intl'

export type UserColumn = {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: Date
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
        cell: ({ row }) => {
          const user = row.original

          const handleDelete = async () => {
            // Tu peux ajouter une confirmation ici
            await removeUser(user.id)
            toast.success(t('actions.deleted'))
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Test</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel />
                <DropdownMenuItem onClick={() => console.log('Edit', user.id)}>
                  <Pencil className="mr-2 h-4 w-4" /> {t('Actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" /> {t('Actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [t]
  )
}
