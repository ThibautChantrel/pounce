'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  ArrowUpDown,
  Trash,
  Pencil,
  Trophy,
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
import { Difficulty } from '@prisma/client'
import { deleteChallengeAction } from '@/actions/challenge/challenge.admin.action'

// Type aplati pour le tableau
export type ChallengeColumn = {
  id: string
  title: string
  location: string
  difficulty: Difficulty
  visible: boolean
  createdAt: Date
}

// Mapping des couleurs pour la difficulté
const DifficultyColors: Record<
  Difficulty,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  EASY: 'secondary', // Vert/Gris clair
  MEDIUM: 'default', // Bleu/Standard
  HARD: 'destructive', // Rouge
  EXPERT: 'destructive', // Rouge foncé
}

const ChallengeActions = ({ challenge }: { challenge: ChallengeColumn }) => {
  const t = useTranslations('Admin')
  const [openDelete, setOpenDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteChallengeAction(challenge.id)

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
              href={`/admin/challenges/${challenge.id}/edit`}
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
          item: challenge.title,
          bold: (chunks) => <strong>{chunks}</strong>,
        })}
      />
    </>
  )
}

export const useChallengeColumns = () => {
  // On récupère les traductions pour les clés génériques (Admin) et spécifiques (Admin.Challenges)
  const t = useTranslations('Admin.Challenges')
  const tGlobal = useTranslations('Admin.Global')
  const tAdmin = useTranslations('Admin')
  const format = useFormatter()

  return useMemo<ColumnDef<ChallengeColumn>[]>(
    () => [
      {
        accessorKey: 'title',
        header: tGlobal('title'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/admin/challenges/${row.original.id}`}
              className="font-medium hover:underline hover:text-blue-600"
            >
              {row.getValue('title')}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: 'location',
        header: t('location'), // Assure-toi d'avoir ajouté "location": "Lieu" dans ton JSON
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.getValue('location')}
          </span>
        ),
      },
      {
        accessorKey: 'difficulty',
        header: t('difficulty'),
        cell: ({ row }) => {
          const diff = row.original.difficulty
          return <Badge variant={DifficultyColors[diff]}>{diff}</Badge>
        },
      },
      {
        accessorKey: 'visible',
        header: tGlobal('visible'),
        cell: ({ row }) => {
          const isVisible = row.original.visible
          return (
            <Badge
              variant={isVisible ? 'default' : 'outline'}
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
        cell: ({ row }) => <ChallengeActions challenge={row.original} />,
      },
    ],
    [t, tGlobal, format]
  )
}
