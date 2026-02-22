'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFormatter, useTranslations } from 'next-intl'
import { Link } from '@/navigation'

export type FeedbackColumn = {
  id: string
  email: string
  message: string
  isRead: boolean
  subscribeToUpdates: boolean
  createdAt: Date
}

export const useFeedbackColumns = () => {
  const t = useTranslations('Admin.Feedbacks')
  const format = useFormatter()

  return useMemo<ColumnDef<FeedbackColumn>[]>(
    () => [
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={(e) => column.toggleSorting(undefined, e.shiftKey)}
          >
            {t('email')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/admin/feedbacks/${row.original.id}`}
              className="font-medium hover:underline hover:text-primary transition-colors"
            >
              {row.getValue('email')}
            </Link>
          </div>
        ),
      },

      {
        accessorKey: 'message',
        header: t('message'),
        cell: ({ row }) => (
          <div
            className="flex items-center gap-2 max-w-100"
            title={row.getValue('message')}
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate text-sm text-muted-foreground">
              {row.getValue('message')}
            </span>
          </div>
        ),
      },

      {
        accessorKey: 'isRead',
        header: t('status'),
        cell: ({ row }) => {
          const isRead = row.original.isRead
          return (
            <Badge
              variant={isRead ? 'secondary' : 'default'}
              className="whitespace-nowrap"
            >
              {isRead ? t('read') : t('unread')}
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
            {t('createdAt')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'))
          return (
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              {format.dateTime(date, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )
        },
      },
    ],
    [t, format]
  )
}
