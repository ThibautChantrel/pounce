// src/components/shared/Modal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ModalProps {
  title: string
  description?: string
  trigger: React.ReactNode // Le bouton qui ouvre le modal
  children: React.ReactNode // Le contenu du modal (ex: votre formulaire)
  open?: boolean // Pour le contrôler depuis le parent (optionnel)
  onOpenChange?: (open: boolean) => void // Pour gérer la fermeture (optionnel)
}

export function Modal({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Zone de contenu principale */}
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
