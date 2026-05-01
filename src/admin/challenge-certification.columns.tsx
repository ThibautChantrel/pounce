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
  toggleChallengeCertificationValid,
  deleteChallengeCertification,
} from '@/actions/certification/certification.admin.actions'

export type ChallengeCertificationColumn = {
  id: string
  completedAt: Date
  isValid: boolean
  challenge: { id: string; title: string }
  user: {
    id: string
    email: string
    pseudo: string | null
    firstName: string | null
    lastName: string | null
  }
}

const ChallengeCertActions = ({
  cert,
}: {
  cert: ChallengeCertificationColumn
}) => {
  const t = useTranslations('Admin.Certifications')
  const tAdmin = useTranslations('Admin')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    setIsPending(true)
    try {
      await toggleChallengeCertificationValid(cert.id)
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
      await deleteChallengeCertification(cert.id)
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
          item: cert.challenge.title,
        })}
      />
    </>
  )
}

export const useChallengeCertificationColumns = () => {
  const t = useTranslations('Admin.Certifications')
  const format = useFormatter()

  return useMemo<ColumnDef<ChallengeCertificationColumn>[]>(
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
        accessorKey: 'challenge',
        header: t('challenge'),
        cell: ({ row }) => (
          <Link
            href={`/admin/challenges/${row.original.challenge.id}`}
            className="font-medium hover:underline hover:text-blue-600 text-sm"
          >
            {row.original.challenge.title}
          </Link>
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
        cell: ({ row }) => <ChallengeCertActions cert={row.original} />,
      },
    ],
    [t, format]
  )
}
