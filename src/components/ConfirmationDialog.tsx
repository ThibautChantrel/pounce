'use client'

import { Loader2 } from 'lucide-react'
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
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DialogVariant = 'delete' | 'update' | 'default'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  isPending?: boolean
  variant?: DialogVariant
  title: string
  description: React.ReactNode
  actionLabel?: string
  cancelLabel?: string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  variant = 'default',
  title,
  description,
  actionLabel = 'Confirmer',
  cancelLabel = 'Annuler',
}: ConfirmationDialogProps) {
  const getActionClassName = () => {
    switch (variant) {
      case 'delete':
        return buttonVariants({ variant: 'destructive' })
      case 'update':
        return cn(
          buttonVariants({ variant: 'default' }),
          'bg-blue-600 hover:bg-blue-700'
        )
      default:
        return buttonVariants({ variant: 'default' })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
            className={getActionClassName()}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
